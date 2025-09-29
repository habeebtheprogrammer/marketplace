const { ambassadorService } = require("../service");
const { successResponse, errorResponse } = require("../utils/responder");
const templates = require("../emailTemplates");
const { sendEmail } = require("../utils/email");

exports.createAmbassador = async (req, res) => {
  try {
    const data = await ambassadorService.createAmbassador({
      fullName: req.body.fullName,
      email: req.body.email,
      university: req.body.university,
      department: req.body.department,
      phone: req.body.phone,
      why: req.body.why,
    });
    // Fire-and-forget email (do not block or fail the main response)
    try {
      const html = templates.ambassador_program_invite({ fullName: req.body.fullName || "there" });
      await sendEmail(data.email, "You're invited: 360 Gadgets Africa Student Ambassador Program", html);
    } catch (mailErr) {
      // Log only; do not disrupt API flow
      console.error("Ambassador invite email failed:", mailErr?.message || mailErr);
    }
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.updateAmbassador = async (req, res) => {
  try {
    const updateObj = {};
    Object.keys(req.body).forEach((key) => {
      updateObj[key] = req.body[key];
    });
    const data = await ambassadorService.updateAmbassador({ _id: updateObj._id }, updateObj);
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.getAmbassadors = async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, search } = req.query;

    const opt = { limit, page };
    if (sort) opt.sort = { [sort]: -1 };

    const query = { archive: false };

    if (search) {
      // support simple text search across fields via text index
      query.$text = { $search: search };
    }

    const options = { sort: { _id: -1 }, ...opt };

    const data = await ambassadorService.getAmbassadors({ query, options });
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};

exports.deleteAmbassador = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return errorResponse(res, { message: 'Ambassador ID is required' }, 400);
    }
    const data = await ambassadorService.deleteAmbassador(id);
    successResponse(res, data);
  } catch (error) {
    errorResponse(res, error);
  }
};
