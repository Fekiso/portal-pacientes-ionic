import React, { useEffect, useState } from "react";
import "./PageError.css";
import { Col, Row } from "react-flexbox-grid";
import { Button, Grid, Typography } from "@material-ui/core";
import { useNavigate } from "react-router-dom";

const PageError = (props) => {
  const { UsuarioLogueado, motivo } = props;
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    if (UsuarioLogueado === null && UsuarioLogueado !== undefined) {
      if (JSON.parse(sessionStorage.getItem("HClgSS")) === null) {
        setUsuario(JSON.parse(sessionStorage.getItem("HClgSS")));
      } else setUsuario = null;
    } else setUsuario(UsuarioLogueado);
  }, []);

  const handleClickRedirigir = (destino) => {
    switch (destino) {
      case "MainPage":
        navigate({
          pathname: "/MainPage",
          Usuario: usuario,
        });
        break;
      case "CerrarSesion":
        navigate({
          pathname: "/",
        });
        break;
      default:
        break;
    }
  };

  return (
    <Grid
      container
      className="fullSize"
      direction="column"
      justifyContent="center"
      alignItems="center"
      id="ERR404"
    >
      <Row className="ErrorViewRow" center="xs" middle="xs">
        <Col xs={11} sm={7} md={6} lg={3}>
          <Typography variant="h3">OH NO!</Typography>
          <Typography variant="h5" align="center">
            Se produjo un error
          </Typography>
          {motivo === "404" && usuario !== null ? (
            <>
              <Typography id="beforeTooLate" align="center">
                <Button
                  className="textLink"
                  // onClick={(e) => handleClickRedirigir("MainPage")}
                  onClick={(e) => handleClickRedirigir("CerrarSesion")}
                >
                  No se ha encontrado la pagina a la que se ha intentado
                  acceder, le redirigiremos al login
                </Button>
              </Typography>
            </>
          ) : motivo === "whitOutUsuario" && usuario === null ? (
            <>
              <Typography id="beforeTooLate" variant="h5" align="center">
                <Button
                  className="textLink"
                  onClick={(e) => handleClickRedirigir("CerrarSesion")}
                >
                  No encontramos su sesion de usuario por favor, inicie sesion
                  de nuevo
                </Button>
              </Typography>
            </>
          ) : (
            <>
              <Typography id="beforeTooLate" variant="h5" align="center">
                <Button
                  className="textLink"
                  onClick={(e) => handleClickRedirigir("CerrarSesion")}
                >
                  Al intentar cargar la pagina, por favor logueese nuevamente
                </Button>
              </Typography>
            </>
          )}
        </Col>
      </Row>
    </Grid>
  );
};
export default PageError;
