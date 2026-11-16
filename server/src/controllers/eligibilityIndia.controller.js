const mongoose = require('mongoose');
const Company = require('../models/Company.model');
const EligibilityAssessment = require('../models/EligibilityAssessment.model');
const LeadEligibilityIndia = require('../models/LeadEligibilityIndia.model');
const eligibilityService = require('../services/eligibilityIndia.service');
const eligibilityView = require('../views/eligibilityIndia.view');

exports.screenIndiaEligibility = async (req, res, next) => {
  try {
    const {
      companyName,
      contactEmail,
      contactPhone,
      companyPan,
      gstin,
      industrySector,
      headcount,
      incorporationDate,
      annualTurnoverInr,
      annualRndPayrollInr,
      annualRndContractorSpendInr,
      annualRndCapitalEquipmentInr,
      isDpiitRecognized,
      dpiitCertificateNumber,
      hasRegisteredIndianPatents,
      hasDsirApprovedLab
    } = req.body;

    if (!companyName || !contactEmail || !industrySector || !incorporationDate || annualTurnoverInr === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing mandatory fields: companyName, contactEmail, industrySector, incorporationDate, annualTurnoverInr'
      });
    }

    // Clean and validate PAN if provided
    const cleanedPan = companyPan && companyPan.trim() !== '' ? companyPan.trim().toUpperCase() : undefined;
    if (cleanedPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanedPan)) {
      return res.status(400).json({
        success: false,
        error: `Invalid Indian PAN format '${companyPan}'. A valid Indian PAN has 5 letters, 4 numbers, and 1 letter (e.g. ABCDE1234F).`
      });
    }

    const screeningResult = eligibilityService.evaluateEligibility({
      industrySector,
      incorporationDate,
      annualTurnoverInr: Number(annualTurnoverInr),
      annualRndPayrollInr: Number(annualRndPayrollInr || 0),
      annualRndContractorSpendInr: Number(annualRndContractorSpendInr || 0),
      annualRndCapitalEquipmentInr: Number(annualRndCapitalEquipmentInr || 0),
      isDpiitRecognized: Boolean(isDpiitRecognized),
      hasRegisteredIndianPatents: Boolean(hasRegisteredIndianPatents),
      hasDsirApprovedLab: Boolean(hasDsirApprovedLab)
    });

    const targetIncentives = [];
    if (screeningResult.isEligibleFor80IAC) targetIncentives.push('SECTION_80_IAC');
    if (screeningResult.isEligibleFor35_2AB) targetIncentives.push('SECTION_35_2AB_DSIR');
    if (screeningResult.isEligibleForPatentBox115BBF) targetIncentives.push('SECTION_115BBF_PATENT');
    if (screeningResult.eligibleGrants && screeningResult.eligibleGrants.length > 0) {
      targetIncentives.push('GOVT_GRANTS_SISFS_BIRAC');
    }

    const generatedCompanyId = 'COMP-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    const generatedAssessmentId = 'ASM-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

    let savedCompany = null;
    let savedAssessment = null;

    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        // Find existing company or create
        if (cleanedPan) {
          savedCompany = await Company.findOne({ pan: cleanedPan });
        }
        if (!savedCompany) {
          savedCompany = await Company.findOne({ contactEmail: contactEmail.toLowerCase().trim() });
        }

        if (!savedCompany) {
          savedCompany = await Company.create({
            companyId: generatedCompanyId,
            legalName: companyName,
            pan: cleanedPan,
            gstin: gstin ? gstin.trim().toUpperCase() : undefined,
            incorporationDate: new Date(incorporationDate),
            dpiitDetails: {
              isRecognized: Boolean(isDpiitRecognized),
              certificateNumber: dpiitCertificateNumber || null
            },
            hasRegisteredIndianPatents: Boolean(hasRegisteredIndianPatents),
            hasDsirApprovedLab: Boolean(hasDsirApprovedLab),
            industrySector,
            headcount: Number(headcount || 1),
            contactEmail: contactEmail.toLowerCase().trim(),
            contactPhone,
            userId: req.user ? req.user._id : undefined
          });
        } else {
          // Update basic details if changed
          savedCompany.legalName = companyName;
          savedCompany.headcount = Number(headcount || savedCompany.headcount);
          savedCompany.hasRegisteredIndianPatents = Boolean(hasRegisteredIndianPatents);
          if (gstin) savedCompany.gstin = gstin.trim().toUpperCase();
          if (req.user && !savedCompany.userId) savedCompany.userId = req.user._id;
          await savedCompany.save();
        }

        if (req.user && !req.user.companyId) {
          req.user.companyId = savedCompany._id;
          await req.user.save();
        }

        // Save Assessment record
        savedAssessment = await EligibilityAssessment.create({
          assessmentId: generatedAssessmentId,
          companyId: savedCompany._id,
          financialMetrics: {
            annualTurnoverInr: Number(annualTurnoverInr),
            annualRndPayrollInr: Number(annualRndPayrollInr || 0),
            annualRndContractorSpendInr: Number(annualRndContractorSpendInr || 0),
            annualRndCapitalEquipmentInr: Number(annualRndCapitalEquipmentInr || 0)
          },
          targetIncentives,
          qualificationResults: {
            isEligibleFor80IAC: screeningResult.isEligibleFor80IAC,
            isEligibleFor35_2AB: screeningResult.isEligibleFor35_2AB,
            isEligibleForPatentBox115BBF: screeningResult.isEligibleForPatentBox115BBF
          },
          estimatedTaxSavingsInr: {
            min: screeningResult.estimatedTaxSavingsMinInr,
            max: screeningResult.estimatedTaxSavingsMaxInr,
            formatted: `₹${(screeningResult.estimatedTaxSavingsMinInr / 100000).toFixed(2)} Lakhs - ₹${(screeningResult.estimatedTaxSavingsMaxInr / 100000).toFixed(2)} Lakhs`
          },
          eligibleGrants: screeningResult.eligibleGrants,
          rationale: screeningResult.rationale,
          disclaimer: screeningResult.disclaimer,
          assessedAt: new Date()
        });

        // Also persist legacy LeadEligibilityIndia for test backward-compatibility
        await LeadEligibilityIndia.create({
          companyName,
          contactEmail,
          contactPhone,
          companyPan: cleanedPan,
          gstin,
          industrySector,
          headcount: Number(headcount || 1),
          incorporationDate,
          annualTurnoverInr: Number(annualTurnoverInr),
          annualRndPayrollInr: Number(annualRndPayrollInr || 0),
          annualRndContractorSpendInr: Number(annualRndContractorSpendInr || 0),
          annualRndCapitalEquipmentInr: Number(annualRndCapitalEquipmentInr || 0),
          isDpiitRecognized: Boolean(isDpiitRecognized),
          dpiitCertificateNumber,
          hasRegisteredIndianPatents: Boolean(hasRegisteredIndianPatents),
          hasDsirApprovedLab: Boolean(hasDsirApprovedLab),
          screeningResult
        });

        // Trigger Notification if user is logged in
        if (req.user) {
          try {
            const Notification = require('../models/Notification.model');
            await Notification.create({
              userId: req.user._id,
              title: 'Eligibility Assessment Completed',
              message: `Evaluated ${savedCompany.legalName}. Candidate for: ${targetIncentives.join(', ') || 'R&D grants'}. Estimated incentive: ${screeningResult.estimatedTaxSavingsInr?.formatted || 'calculated'}.`,
              type: 'ASSESSMENT',
              link: '/dashboard/assessments'
            });
          } catch (notifErr) {
            // non-blocking
          }
        }
      }
    } catch (dbError) {
      console.warn(`[DB Persist Note]: ${dbError.message}`);
    }

    const companyResponse = savedCompany || {
      _id: new mongoose.Types.ObjectId(),
      companyId: generatedCompanyId,
      legalName: companyName,
      pan: cleanedPan,
      gstin,
      contactEmail,
      contactPhone,
      industrySector,
      headcount
    };

    const assessmentResponse = savedAssessment || {
      _id: new mongoose.Types.ObjectId(),
      assessmentId: generatedAssessmentId,
      targetIncentives,
      qualificationResults: {
        isEligibleFor80IAC: screeningResult.isEligibleFor80IAC,
        isEligibleFor35_2AB: screeningResult.isEligibleFor35_2AB,
        isEligibleForPatentBox115BBF: screeningResult.isEligibleForPatentBox115BBF
      },
      estimatedTaxSavingsInr: {
        min: screeningResult.estimatedTaxSavingsMinInr,
        max: screeningResult.estimatedTaxSavingsMaxInr,
        formatted: `₹${(screeningResult.estimatedTaxSavingsMinInr / 100000).toFixed(2)} Lakhs - ₹${(screeningResult.estimatedTaxSavingsMaxInr / 100000).toFixed(2)} Lakhs`
      },
      eligibleGrants: screeningResult.eligibleGrants,
      rationale: screeningResult.rationale,
      disclaimer: screeningResult.disclaimer
    };

    return res.status(201).json({
      success: true,
      data: {
        // Legacy formatted fields for existing UI compatibility
        leadId: companyResponse._id,
        companyName: companyResponse.legalName,
        industrySector: companyResponse.industrySector,
        isEligibleFor80IAC: screeningResult.isEligibleFor80IAC,
        isEligibleFor35_2AB: screeningResult.isEligibleFor35_2AB,
        isEligibleForPatentBox115BBF: screeningResult.isEligibleForPatentBox115BBF,
        estimatedTaxSavingsInr: {
          min: screeningResult.estimatedTaxSavingsMinInr,
          max: screeningResult.estimatedTaxSavingsMaxInr,
          formatted: `₹${(screeningResult.estimatedTaxSavingsMinInr / 100000).toFixed(2)} Lakhs - ₹${(screeningResult.estimatedTaxSavingsMaxInr / 100000).toFixed(2)} Lakhs`
        },
        eligibleGrants: screeningResult.eligibleGrants,
        rationale: screeningResult.rationale,
        disclaimer: screeningResult.disclaimer,
        // Workflow Context Linkage for Module 2 & 3
        company: companyResponse,
        assessment: assessmentResponse,
        nextStep: 'ENGAGEMENT'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve company profile and latest assessment for Module 2 and Module 3
 */
exports.getCompanyContext = async (req, res, next) => {
  try {
    const { id } = req.params;
    let company = null;

    if (mongoose.isValidObjectId(id)) {
      company = await Company.findById(id);
    }
    if (!company) {
      company = await Company.findOne({ companyId: id });
    }
    if (!company) {
      company = await Company.findOne().sort({ createdAt: -1 });
    }

    if (!company) {
      return res.status(404).json({ success: false, error: 'Company record not found' });
    }

    const assessment = await EligibilityAssessment.findOne({ companyId: company._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        company,
        assessment
      }
    });
  } catch (error) {
    next(error);
  }
};
