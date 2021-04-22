export const mochaAsync = fn => (done) => {
  fn.call().then(done, (err) => {
    done(err);
  });
};

export const detectValidationErrors = (res) => {
  if (res.message == 'Validation errors') {
    console.log(res.errors[0]);
    return true;
  }
  return false;
};
