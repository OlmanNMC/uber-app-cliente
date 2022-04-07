const { PrismaClient } = require("@prisma/client");
const { request } = require("express");
const { response } = require("express");
const prisma = new PrismaClient();

exports.updateViaje = async (req = request, res = response) => {
  await prisma.viajes.update({
    data: req.body,
    where: {
      id: req.params.id,
    },
  });
  res.redirect("/viajes");
};

exports.getViajes = async (req = request, res = response) => {
  if (!req.session.userid) {
    return res.redirect("/");
  }
  const viajes = await prisma.viajes.findMany({
    select: {
      id: true,

      clienteId: true,
      conductorId: true,
      destino: true,
      metodoPago: true,
      monto: true,
      conductores: {
        select: {
          direccion: true,
          nombre: true,
          correo: true,
          imagen: true,
          tipoCarro: true,
          telefono: true,
        },
      },
      clientes: {
        select: {
          nombre: true,
          direccion: true,
          imagen: true,
          telefono: true,
        },
      },
    },
    where: {
      clienteId: req.session.userid,
    },
  });
  res.render("viajes", { viajes });
};
exports.postViaje = async (req = request, res = response) => {
  const viaje = await prisma.viajes.create({
    data: {
      clienteId: Number(req.session.userid),
      conductorId: Number(req.body.conductor),
      destino: req.body.destino,
    },
  });
  res.json(viaje);
};
