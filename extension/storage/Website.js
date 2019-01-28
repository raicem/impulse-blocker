class Website {
  static create(url) {
    return {
      domain: url,
      isActive: true,
      timesBlocked: 0,
      createdAt: new Date(),
    };
  }
}

export default Website;
