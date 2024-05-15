const controllerWrapper = (ctrlr) => {
  return async (req, res, next) => {
    try {
      await ctrlr(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default controllerWrapper;
