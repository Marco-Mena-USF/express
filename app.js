const express = require('express');
const app = express();
const ExpressError = require('./expressError');
const { convertAndValidateNumsArray, findMode, findMean, findMedian } = require('./helpers');

function handleRequest(req, res, next, operation) {
  try {
    if (!req.query.nums) {
      throw new ExpressError('You must pass a query key of nums with a comma-separated list of numbers.', 400);
    }

    const numsAsStrings = req.query.nums.split(',');
    const nums = convertAndValidateNumsArray(numsAsStrings);

    if (nums instanceof Error) {
      throw new ExpressError(nums.message);
    }

    const result = {
      operation,
      result: operation === 'mean' ? findMean(nums) : (operation === 'median' ? findMedian(nums) : findMode(nums))
    };

    res.send(result);
  } catch (err) {
    next(err);
  }
}

app.get('/mean', (req, res, next) => handleRequest(req, res, next, 'mean'));

app.get('/median', (req, res, next) => handleRequest(req, res, next, 'median'));

app.get('/mode', (req, res, next) => handleRequest(req, res, next, 'mode'));

app.use((req, res, next) => {
  const err = new ExpressError('Not Found', 404);
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: err,
    message: err.message
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}`);
});