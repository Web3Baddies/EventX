import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TicketModule = buildModule("TicketModule", (m) => {
  const name = m.getParameter("name", "EvvntX Tickets");
  const symbol = m.getParameter("symbol", "Evnt");

  const ticket = m.contract("Ticket", [name, symbol]);

  return {
    ticket,
  };
});

export default TicketModule;
