class BadRequestError extends Error {
    constructor(message) {
      super(message); 
      this.name = "ValidationError";
    }
}

class InternalServerError extends Error {
    constructor(message) {
      super(message); 
      this.name = "ValidationError";
    }
}

class AuthorizationError extends Error {
    constructor(message) {
      super(message); 
      this.name = "ValidationError";
    }
}

module.exports={
  BadRequestError,
  InternalServerError,
  AuthorizationError
}

