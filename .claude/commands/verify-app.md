Run the full verification suite for this project after any significant change.

Steps:
1. Run `npm test -- --runInBand` to run the Jest suite serially. The suite uses supertest and exercises every API endpoint directly, so passing tests confirm the server and all endpoints are working correctly.
2. If any tests fail, fix the implementation (not the tests, unless the test itself is wrong) and run step 1 again. Repeat until all tests pass.
3. Report the result clearly:
   - If all tests pass: state that all tests passed and all endpoints are verified.
   - If tests still fail after fixes: list the specific failures (test name, file, reason) that still need addressing.
