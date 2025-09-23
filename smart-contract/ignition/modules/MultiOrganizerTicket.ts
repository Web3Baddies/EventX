import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MultiOrganizerTicketModule = buildModule("MultiOrganizerTicketModule", (m) => {
  const name = m.getParameter("name", "EventX Tickets");
  const symbol = m.getParameter("symbol", "EVTX");

  const ticket = m.contract("Ticket", [name, symbol]);

  // Note: Organizer approval and event creation would be done in post-deployment scripts
  // since they require specific wallet addresses and are not part of the initial deployment

  return {
    ticket,
  };
});

export default MultiOrganizerTicketModule;

