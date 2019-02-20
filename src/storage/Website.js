import dayjs from 'dayjs';

class Website {
  static create(url) {
    return {
      domain: url,
      isActive: true,
      timesBlocked: 0,
      createdAt: dayjs().format(),
    };
  }
}

export default Website;
