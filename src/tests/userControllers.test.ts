import chai from "chai";
import request from "supertest";
import app from "../index";
import User from "../models/User";

describe("User controller requests...", () => {
  const requestBody = {
    email: "email@example.com",
    password: "placeholderPassword",
    profile: {
      names: "example",
      lastNames: "last names"
    }
  };

  after(() => {
    User.remove({}).then(() => {
      console.log("User tests done...");
    });
  });

  it("Should sign up a user", (done: Mocha.Done) => {
    request(app)
      .post("/api/v1/users/sign-up/")
      .send(requestBody)
      .expect(200, done);
  });

  it("Should sign in a user", (done: Mocha.Done) => {
    request(app)
      .post("/api/v1/users/sign-in/")
      .send({
        email: requestBody.email,
        password: requestBody.password
      })
      .expect(200, done);
  });

  describe("Current user data tests...", () => {
    it("Should return status 200 with a correct token", (done: Mocha.Done) => {
      const agent = request(app);
      agent
        .post("/api/v1/users/sign-in/")
        .send({
          email: requestBody.email,
          password: requestBody.password
        })
        .expect(200)
        .end((signInError, signInResponse) => {
          if (!signInError) {
            const { token } = signInResponse.body;
            agent
              .get("/api/v1/users/current-user/")
              .set("Authorization", `Bearer ${token}`)
              .expect(200, done);
          } else {
            done(signInError);
          }
        });
    });

    it("Should return status 401 with no token", (done: Mocha.Done) => {
      const agent = request(app);
      agent.get("/api/v1/users/current-user").expect(401, done);
    });
  });
});
