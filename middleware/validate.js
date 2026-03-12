/**
 * middleware/validate.js — Request validation helpers.
 *
 * Simple validation middleware factory. For production, consider
 * using Joi, Zod, or express-validator.
 */

/**
 * Validate that required fields exist in req.body.
 * @param {Array<string>} fields — Required field names
 * @returns {Function} Express middleware
 */
function requireFields(fields) {
  return function(req, res, next) {
    var missing = [];
    fields.forEach(function(field) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields: ' + missing.join(', '),
      });
    }
    next();
  };
}

/**
 * Validate that a field value is one of the allowed values.
 * @param {string} field — Field name in req.body
 * @param {Array<string>} allowed — Allowed values
 * @returns {Function} Express middleware
 */
function allowedValues(field, allowed) {
  return function(req, res, next) {
    if (req.body[field] !== undefined && allowed.indexOf(req.body[field]) === -1) {
      return res.status(400).json({
        error: field + ' must be one of: ' + allowed.join(', '),
      });
    }
    next();
  };
}

module.exports = {
  requireFields: requireFields,
  allowedValues: allowedValues,
};
