const { response, request } = require("express");
const { PrismaClient } = require("@prisma/client");
const { bucket, s3 } = require("../config/s3Upload");
const prisma = new PrismaClient();

exports.postPerfil = async (req = request, res = response) => {
  let { conductor } = req.session;
  try {
    if (req.file) {
      req.body.imagen = req.file.location;
      // req.body.imagenCarro = req.file.filename;
      if (req.session.perfil) {
        s3.deleteObject(
          { Bucket: bucket, Key: req.session.perfil },
          (err, data) => {
            if (err) {
              console.log("aws-deleteObject-error:", err);
            }
            console.log("aws-deleteObject:", data);
          }
        );
      }
    }
    let usuario;
    req.body.ciudadId = Number(req.body.ciudadId);
    if (conductor) {
      usuario = await prisma.conductores.update({
        data: req.body,
        where: {
          id: req.session.userid,
        },
      });
    } else {
      usuario = await prisma.clientes.update({
        data: req.body,
        where: {
          id: req.session.userid,
        },
      });
    }
    req.session.perfil = usuario.imagen;
    res.redirect("/perfil");
  } catch (error) {
    res.render("perfil", {
      error: "Lo sentimo ha ocurrido un error intente mas tarde",
    });
  }
};
exports.getPerfil = async (req = request, res = response) => {
  if (!req.session.userid) {
    return res.redirect("/");
  }
  let usuario;
  if (req.session.conductor) {
    usuario = await prisma.conductores.findUnique({
      where: {
        id: req.session.userid,
      },
      include: {
        ciudad: true,
      },
    });
  } else {
    usuario = await prisma.clientes.findUnique({
      include: {
        ciudad: true,
      },
      where: {
        id: req.session.userid,
      },
    });
  }
  const ciudades = await prisma.ciudad.findMany({
    where: {
      id: {
        not: usuario.ciudadId,
      },
    },
  });
  res.render("perfil", {
    usuario,
    conductor: req.session.conductor,
    ciudades,
  });
};
