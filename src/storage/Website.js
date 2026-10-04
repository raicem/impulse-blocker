import dayjs from 'dayjs';

class Website {
  static create(url) {
    return {
      domain: url,
      includeSubdomains: true,
      isActive: true,
      timesBlocked: 0,
      createdAt: dayjs().format(),
    };
  }
}

export default Website;
