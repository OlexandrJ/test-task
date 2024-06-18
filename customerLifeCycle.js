const axios = require("axios");

class CustomerLifeCycle {
  constructor(customerId, email) {
    this.customerId = customerId;
    this.email = email;
    this.state = "lead";
    this.stateEntryTime = new Date();
    this.purchases = 0;
    this.baseUrl = "https://esputnik.com/api/v1/message/email";
    this.apiKey = "239F5E4F3DB2E269A4D5504EF294D90D";
  }

  async sendEmail(textId) {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          recipients: [{ email: this.email }],
          email: {
            subject: `Notification for ${this.state}`,
            text: `Email text for state ${this.state}`,
            from: { name: "YourCompany", email: "no-reply@yourcompany.com" },
          },
          textId: textId,
        },
        {
          headers: {
            Authorization: `Basic ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        `Email sent to customer ${this.customerId} with text: ${textId}`
      );
    } catch (error) {
      console.error(`Email could not be sent: ${error}`);
    }
  }

  checkState(t, n) {
    const currentTime = new Date();

    if (this.state === "lead") {
      if (currentTime.getTime() - this.stateEntryTime.getTime() > t) { {
        this.state = "sleep_leads";
        this.sendEmail(this.state);
      } else if (this.purchases >= 1) {
        this.state = "new_clients";
        this.stateEntryTime = currentTime;
      }
    }

    if (this.state === "new_clients") {
      if (currentTime - this.stateEntryTime > t && this.purchases < n) {
        this.state = "need_reactivation_clients";
        this.sendEmail("need_reactivation");
      } else if (this.purchases >= n) {
        this.state = "active_clients";
        this.stateEntryTime = currentTime;
      }
    }

    if (this.state === "active_clients") {
      if (currentTime - this.stateEntryTime > t && this.purchases < n) {
        this.state = "need_reactivation_clients";
        this.sendEmail("need_reactivation");
      }
    }

    if (this.state === "need_reactivation_clients") {
      if (this.purchases >= n) {
        this.state = "active_clients";
        this.stateEntryTime = currentTime;
      }
    }
  }

  makePurchase() {
    this.purchases += 1;
    this.checkState(0, 0);
  }

  toString() {
    return `Customer ${this.customerId}: state ${this.state}, purchases ${this.purchases}, time in state ${this.stateEntryTime}`;
  }
}

module.exports = CustomerLifeCycle;
