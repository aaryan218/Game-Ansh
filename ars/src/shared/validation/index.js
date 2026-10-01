function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors });
    }
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };
