const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

const create = async (userId, { workstationId, labRoomId, category, description }) => {
  if (!workstationId && !labRoomId) {
    throw ApiError.badRequest("Either workstationId or labRoomId is required");
  }

  const ticket = await prisma.incidentTicket.create({
    data: {
      workstationId,
      labRoomId,
      category,
      description,
      reportedById: userId,
      status: "open",
    },
    include: {
      reportedBy: { select: { id: true, username: true, fullName: true } },
      workstation: true,
      labRoom: true,
    },
  });

  return ticket;
};

const list = async ({ status, category, workstationId, labRoomId, page = 1, pageSize = 10 }) => {
  const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
  const take = parseInt(pageSize, 10);

  const where = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (workstationId) where.workstationId = parseInt(workstationId, 10);
  if (labRoomId) where.labRoomId = parseInt(labRoomId, 10);

  const [items, total] = await Promise.all([
    prisma.incidentTicket.findMany({
      where,
      skip,
      take,
      include: {
        reportedBy: { select: { id: true, username: true, fullName: true } },
        workstation: true,
        labRoom: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.incidentTicket.count({ where }),
  ]);

  return {
    items,
    total,
    page: parseInt(page, 10),
    pageSize: parseInt(pageSize, 10),
  };
};

const getById = async (id) => {
  const ticket = await prisma.incidentTicket.findUnique({
    where: { id },
    include: {
      reportedBy: { select: { id: true, username: true, fullName: true } },
      assignedTo: { select: { id: true, username: true, fullName: true } },
      workstation: true,
      labRoom: true,
    },
  });

  if (!ticket) {
    throw ApiError.notFound("Ticket not found");
  }

  return ticket;
};

const updateStatus = async (userId, ticketId, { status, resolutionNote }) => {
  const ticket = await prisma.incidentTicket.update({
    where: { id: ticketId },
    data: {
      status,
      resolutionNote: resolutionNote || null,
      assignedToId: userId,
      updatedAt: new Date(),
    },
    include: {
      reportedBy: { select: { id: true, username: true, fullName: true } },
      assignedTo: { select: { id: true, username: true, fullName: true } },
      workstation: true,
      labRoom: true,
    },
  });

  return ticket;
};

const deleteTicket = async (id) => {
  await prisma.incidentTicket.delete({
    where: { id },
  });
};

module.exports = {
  create,
  list,
  getById,
  updateStatus,
  deleteTicket,
};
