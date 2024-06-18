const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const CustomerLifeCycle = require("./customerLifeCycle");
const config = require("./config.json");

const app = express();

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "blob:"],
    },
  })
);

app.use(bodyParser.json());

const customers = {};

app.post("/register", (req, res) => {
  const { customerId, email } = req.body;
  customers[customerId] = new CustomerLifeCycle(customerId, email);
  res.send(`Customer ${customerId} is registered`);
});

app.post("/purchase", (req, res) => {
  const { customerId } = req.body;
  if (customers[customerId]) {
    customers[customerId].makePurchase();
    res.send(`Customer ${customerId} made a purchase`);
  } else {
    res.status(404).send("Customer not found");
  }
});

app.post("/checkState", (req, res) => {
  const { customerId } = req.body;
  if (customers[customerId]) {
    customers[customerId].checkState(
      config.timeToSleepLeads,
      config.requiredPurchases
    );
    res.send(`Customer status ${customerId} is checked`);
  } else {
    res.status(404).send("Customer not found");
  }
});

app.listen(3000, () => {
  console.log("Startup server on port 3000");
});
