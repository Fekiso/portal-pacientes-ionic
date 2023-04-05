import React, { Component } from "react";
import PageError from "../PageError/PageError";
import MarcoConfirmarCancelarTurno from "../components/MessageBoxs/marcoCancelarTurno";
import "../App.css";

import * as moment from "moment";
import { Grid, Row, Col } from "react-flexbox-grid";
import {
  AccountBox,
  AccountCircleOutlined,
  Cached,
  ChevronLeft,
  Close,
  ExitToAppOutlined,
  Person,
} from "@material-ui/icons";

import {
  AppBar,
  Button,
  Card,
  CardContent,
  CircularProgress,
  CssBaseline,
  Divider,
  FormControl,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Snackbar,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid as GridMUI,
  Box,
  withStyles,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import axios from "axios";
import LoadingOverlay from "react-loading-overlay";
import { useNavigate } from "react-router-dom";
LoadingOverlay.propTypes = undefined;
var token = "";
var urlRest = "";

const CustomAlert = (props) => {
  return <Alert elevation={6} variant="filled" {...props} />;
};

const Item = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

class ConsultarHorarios extends Component {
  constructor(props) {
    super();
    this.state = {
      UsuarioLogueado: null,
      snackbar: {
        snackbarOpen: false,
        snackbarText: null,
        snackbarColor: "black",
      },
      prestadorSelect: { codigo: null, nombre: "" },
      especialidadSelect: { codigo: null, nombre: "" },
      especialidades: [],
      prestadores: [],
      horarios: [],
      mostrarHorarios: false,
      loading: false,
      mobileOpen: false,
    };

    this.handleChangeSelect = this.handleChangeSelect.bind(this);
    this.TraerHorarios = this.TraerHorarios.bind(this);
  }

  snackbarEstado = (estado, mensaje, tipo) => {
    let snackbar = this.state.snackbar;
    snackbar["snackbarOpen"] = estado;
    snackbar["snackbarText"] = mensaje;
    switch (tipo) {
      case "Correcto":
        snackbar["snackbarColor"] = "success";
        break;
      case "Advertencia":
        snackbar["snackbarColor"] = "warning";
        break;
      case "Error":
        snackbar["snackbarColor"] = "error";
        break;
      case "Info":
        snackbar["snackbarColor"] = "info";
        break;
      default:
        break;
    }
    this.setState({ snackbar: snackbar });
  };

  snackbarCerrar = () => {
    var snackbar = this.state.snackbar;
    snackbar["snackbarOpen"] = false;
    snackbar["snackbarText"] = "";
    snackbar["snackbarColor"] = "success";

    this.setState({ snackbar: snackbar });
  };

  componentDidMount() {
    token = sessionStorage.getItem("AppHCToken");
    urlRest = localStorage.getItem("urlAxio");

    const UsuarioLogueado = JSON.parse(
      sessionStorage.getItem("UsuarioLogueado")
    );

    if (UsuarioLogueado === null) {
      this.setState({
        UsuarioLogueado: this.props.location.Usuario,
        fechaSelect: moment().format("YYYY-MM-DD"),
      });
      this.traerPrestadores();
      this.traerEspecialidades();
    } else {
      this.setState({ UsuarioLogueado: UsuarioLogueado });
      this.traerPrestadores();
      this.traerEspecialidades();
    }
    this.handleChangeSelectEspecialidad(-1);
  }

  handleChangeSelect = (event) => {
    if (event.target.name === "Especialidad") {
      this.handleChangeSelectPrestador(null);
      this.handleChangeSelectEspecialidad(event.target.value);
    } else if (event.target.name === "Prestador") {
      this.handleChangeSelectEspecialidad(this.state.especialidadSelect.codigo);
      this.handleChangeSelectPrestador(event.target.value);
      this.TraerHorarios(event.target.value);
    }
  };

  handleChangeSelectEspecialidad = (codigo) => {
    let nombre;
    if (codigo !== -1) {
      this.state.especialidades.forEach(function (item) {
        if (item.codigo === codigo) {
          nombre = item.nombre;
        }
      });
    } else {
      nombre = "Todas";
    }
    this.setState({
      especialidadSelect: {
        codigo: codigo,
        nombre: nombre,
      },
      prestadorSelect: { codigo: null, nombre: "" },
      horarios: null,
    });
  };

  handleChangeSelectPrestador = (codigo) => {
    let nombre = "";
    this.state.prestadores.forEach(function (prestador) {
      if (prestador.codigo === codigo) {
        nombre = prestador.nombre;
      }
    });
    this.setState({
      prestadorSelect: {
        codigo: codigo,
        nombre: nombre,
      },
    });
  };

  async traerEspecialidades() {
    let especialidades = null;

    var config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    this.setState({ loading: true });
    await axios
      .get(`${urlRest}Especialidades`, config)
      .then((res) => {
        if (res.data.length !== 0) {
          especialidades = res.data;
        } else {
          especialidades = null;
        }
      })
      .catch((e) => {
        console.log("Error");
        console.log(e.response);
        this.setState({ loading: false });
      });

    if (especialidades === null) {
      this.snackbarEstado(
        true,
        "No hay especialidades disponibles para elegir",
        "Error"
      );
    }
    this.setState({ especialidades: especialidades, loading: false });
  }

  async TraerHorarios(prestador) {
    let horarios = null;
    let pasa = false;
    let servicio = null;

    var config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    if (prestador !== null) {
      this.setState({ loading: true });
      await axios
        .get(`${urlRest}Servicios`, config)
        .then((response) => {
          if (response.data.length !== 0) {
            servicio = response.data;
          } else {
            servicio = null;
          }
        })
        .catch((e) => {
          console.log("Error");
          console.log(e.response);
          this.setState({ loading: false });
        });

      if (servicio.codigo !== null) {
        this.setState({ loading: true });
        await axios
          .get(
            `${urlRest}PrestadoresHorarios/${prestador}?servicio=${servicio[0].codigo}`,
            config
          )
          .then((response) => {
            if (response.data.length !== 0) {
              horarios = response.data;
            } else {
              horarios = null;
            }
          })
          .catch((e) => {
            console.log("Error");
            console.log(e.response);
            this.setState({ loading: false });
          });
      }

      if (horarios === null) {
        this.snackbarEstado(
          true,
          "El prestador seleccionado no tiene un horario definido",
          "Error"
        );
      }
      pasa = true;
      this.setState({
        horarios: horarios,
        loading: false,
        mostrarHorarios: pasa,
      });
      servicio = null;
    }
  }

  async traerPrestadores() {
    let prestadores = null;

    var config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    this.setState({ loading: true });
    await axios
      .get(`${urlRest}Prestadores`, config)
      .then((res) => {
        if (res.data.length !== 0) {
          prestadores = res.data;
        } else {
          prestadores = null;
        }
      })
      .catch((e) => {
        console.log("Error");
        console.log(e.response);
        this.setState({ loading: false });
      });

    if (prestadores === null) {
      this.snackbarEstado(
        true,
        "No hay prestadores disponibles para elegir",
        "Error"
      );
    }
    this.setState({ prestadores: prestadores, loading: false });
  }

  filtrarPrestadores() {
    let listaPrestadores = [];
    let nuevaLista = [];
    listaPrestadores = this.state.prestadores;
    if (
      this.state.especialidadSelect !== {} &&
      this.state.especialidadSelect.codigo !== null &&
      this.state.especialidadSelect.codigo !== -1
    ) {
      listaPrestadores.map((prestador) => {
        if (
          prestador.especialidad === this.state.especialidadSelect.codigo &&
          prestador.vigente === true
        ) {
          nuevaLista.push(prestador);
        }
      });
    } else {
      listaPrestadores.map((prestador) => {
        if (prestador.vigente === true) {
          nuevaLista.push(prestador);
        }
      });
    }
    return nuevaLista;
  }

  filtrarEspecilidades() {
    let listaEspecialidades = [];
    let nuevaLista = [];

    listaEspecialidades = this.state.especialidades;
    listaEspecialidades.map((especialidad) => {
      if (especialidad.vigente === true) {
        nuevaLista.push(especialidad);
      }
    });

    return nuevaLista;
  }

  handleClickRedirigir = (destino) => {
    switch (destino) {
      case "MainPage":
        this.props.navigate({
          pathname: "/MainPage",
          Usuario: this.state.UsuarioLogueado,
        });
        break;
      case "DatosPaciente":
        this.props.navigate({
          pathname: "/DatosPaciente",
          Usuario: this.state.UsuarioLogueado,
          Origen: "NuevoTurno",
        });
        break;
      case "CerrarSesion":
        this.props.navigate({
          pathname: "/",
        });
        break;
      default:
        break;
    }
  };

  abrirCerrarMenuCuenta(event) {
    this.setState({
      abrirMenuCuenta:
        this.state.abrirMenuCuenta === null ? event.currentTarget : null,
    });
  }

  render() {
    if (this.state.prestadores !== null) {
      var strCargarSelectPrestadores = this.filtrarPrestadores().map(
        (option, i) => {
          return (
            <MenuItem key={i} value={option.codigo}>
              <Typography variant="body2">{option.nombre}</Typography>
            </MenuItem>
          );
        }
      );
      if (this.state.especialidades !== null) {
        var strCargarSelectEspecialidades = this.filtrarEspecilidades().map(
          (option, i) => {
            return (
              <MenuItem key={i} value={option.codigo}>
                <Typography variant="body2">{option.nombre}</Typography>
              </MenuItem>
            );
          }
        );
      }
    }
    var strTablaHorarios = null;
    if (this.state.horarios !== null) {
      let horarios = this.state.horarios;
      strTablaHorarios = horarios.map((horario, i) => {
        {
          return (
            <TableContainer>
              <Table aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2">Dia</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">Horarios</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">Virtualmente</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell variant="head">
                      <Typography variant="body2">Domingo</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.domingoM === ""
                          ? horario.domingoT === ""
                            ? ""
                            : horario.domingoT
                          : horario.domingoM +
                            (horario.domingoT === ""
                              ? ""
                              : " y " + horario.domingoT)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.domMEsVirtual === 0
                          ? horario.domTEsVirtual === 0
                            ? "No"
                            : "Tarde"
                          : horario.domTEsVirtual === 0
                          ? "Mañana"
                          : "Mañana y tarde"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell variant="head">
                      <Typography variant="body2">Lunes</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.lunesM === ""
                          ? horario.lunesT === ""
                            ? ""
                            : horario.lunesT
                          : horario.lunesM +
                            (horario.lunesT === ""
                              ? ""
                              : " y " + horario.lunesT)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.lunMEsVirtual === 0
                          ? horario.lunTEsVirtual === 0
                            ? "No"
                            : "Tarde"
                          : horario.lunTEsVirtual === 0
                          ? "Mañana"
                          : "Mañana y tarde"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell variant="head">
                      <Typography variant="body2">Martes</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.martesM === ""
                          ? horario.martesT === ""
                            ? ""
                            : horario.martesT
                          : horario.martesM +
                            (horario.martesT === ""
                              ? ""
                              : " y " + horario.martesT)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.marMEsVirtual === 0
                          ? horario.marTEsVirtual === 0
                            ? "No"
                            : "Tarde"
                          : horario.marTEsVirtual === 0
                          ? "Mañana"
                          : "Mañana y tarde"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell variant="head">
                      <Typography variant="body2">Miercoles</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.miercolesM === ""
                          ? horario.miercolesT === ""
                            ? ""
                            : horario.miercolesT
                          : horario.miercolesM +
                            (horario.miercolesT === ""
                              ? ""
                              : " y " + horario.miercolesT)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.mieMEsVirtual === 0
                          ? horario.mieTEsVirtual === 0
                            ? "No"
                            : "Tarde"
                          : horario.mieTEsVirtual === 0
                          ? "Mañana"
                          : "Mañana y tarde"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell variant="head">
                      <Typography variant="body2">Jueves</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.juevesM === ""
                          ? horario.juevesT === ""
                            ? ""
                            : horario.juevesT
                          : horario.juevesM +
                            (horario.juevesT === ""
                              ? ""
                              : " y " + horario.juevesT)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.jueMEsVirtual === 0
                          ? horario.jueTEsVirtual === 0
                            ? "No"
                            : "Tarde"
                          : horario.jueTEsVirtual === 0
                          ? "Mañana"
                          : "Mañana y tarde"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell variant="head">
                      <Typography variant="body2">Viernes</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.viernesM === ""
                          ? horario.viernesT === ""
                            ? ""
                            : horario.viernesT
                          : horario.viernesM +
                            (horario.viernesT === ""
                              ? ""
                              : " y " + horario.viernesT)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.vieMEsVirtual === 0
                          ? horario.vieTEsVirtual === 0
                            ? "No"
                            : "Tarde"
                          : horario.vieTEsVirtual === 0
                          ? "Mañana"
                          : "Mañana y tarde"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell variant="head">
                      <Typography variant="body2">Sabado</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.sabadoM === ""
                          ? horario.sabadoT === ""
                            ? ""
                            : horario.sabadoT
                          : horario.sabadoM +
                            (horario.sabadoT === ""
                              ? ""
                              : " y " + horario.sabadoT)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {horario.sabMEsVirtual === 0
                          ? horario.sabTEsVirtual === 0
                            ? "No"
                            : "Tarde"
                          : horario.sabTEsVirtual === 0
                          ? "Mañana"
                          : "Mañana y tarde"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          );
        }
      });
    } else {
      strTablaHorarios = null;
    }

    return (
      <GridMUI>
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={this.state.snackbar.snackbarOpen}
          autoHideDuration={5000}
          onClose={this.snackbarCerrar}
        >
          <CustomAlert
            CustomAlert
            onClose={this.snackbarCerrar}
            severity={this.state.snackbar.snackbarColor}
          >
            {this.state.snackbar.snackbarText}
          </CustomAlert>
        </Snackbar>
        {this.state.UsuarioLogueado === null ? (
          <PageError motivo="whitOutUsuario" />
        ) : (
          <LoadingOverlay
            active={this.state.todoCargando}
            spinner
            text="Buscando paciente ..."
          >
            <Row between="xs" className="EncabezadoAppBar">
              <GridMUI
                item
                xs={4}
                alignItems="center"
                style={{ padding: "0" }}
                onClick={(e) => this.handleClickRedirigir("MainPage")}
              >
                <Item>
                  <Button
                    fontSize="medium"
                    size="medium"
                    fullWidth
                    style={{ color: "white" }}
                    name="MainPage"
                    endIcon={
                      <ChevronLeft
                        fontSize="medium"
                        style={{ color: "#fff" }}
                      />
                    }
                  >
                    <Typography variant="body1" style={{ color: "white" }}>
                      Regresar
                    </Typography>
                  </Button>
                </Item>
              </GridMUI>
              <GridMUI item xs="auto" />
              <GridMUI
                item
                alignItems="center"
                style={{ padding: "0" }}
                onClick={(e) => this.abrirCerrarMenuCuenta(e)}
              >
                <Item>
                  <Button
                    fontSize="medium"
                    size="medium"
                    fullWidth
                    style={{ color: "white" }}
                    name="Menu"
                    startIcon={
                      <AccountCircleOutlined
                        fontSize="medium"
                        style={{ color: "#fff" }}
                      />
                    }
                  >
                    <Typography variant="body1" style={{ color: "white" }}>
                      {this.state.UsuarioLogueado.nombre}
                    </Typography>
                  </Button>
                </Item>
                <Menu
                  anchorEl={this.state.abrirMenuCuenta}
                  open={Boolean(this.state.abrirMenuCuenta)}
                  onClose={(e) => this.abrirCerrarMenuCuenta(e)}
                >
                  <MenuItem>
                    <Typography variant="body1">
                      {this.state.UsuarioLogueado.apellido},{" "}
                      {this.state.UsuarioLogueado.nombre}
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={(e) => this.handleClickRedirigir("DatosPaciente")}
                  >
                    <ListItemIcon>
                      <AccountBox fontSize="large" />
                    </ListItemIcon>
                    <Typography variant="body1">Mi Cuenta</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => this.handleClickRedirigir("CerrarSesion")}
                  >
                    <ListItemIcon>
                      <ExitToAppOutlined fontSize="large" />
                    </ListItemIcon>
                    <Typography variant="body1">Cerrar sesion</Typography>
                  </MenuItem>
                </Menu>
              </GridMUI>
            </Row>
            <Row style={{ padding: "5px" }}>
              <Col xs={12}>
                {this.state.loading ? (
                  <Card className="Card">
                    <CardContent>
                      <Row>
                        <CircularProgress size={50} />
                      </Row>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="banner">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Horarios de atencion de nuestros prestadores
                      </Typography>
                      <Row middle="xs" between="md">
                        <Col xs={12}>
                          <FormControl variant="filled" margin="dense">
                            <TextField
                              select
                              label="Especialidad"
                              name="Especialidad"
                              id="cboEspecialidad"
                              onChange={this.handleChangeSelect}
                              value={this.state.especialidadSelect.codigo}
                              InputProps={{
                                startAdornment: (
                                  <IconButton
                                    fontSize="large"
                                    style={{ color: "#1e58bd" }}
                                    aria-label="Historial de turnos"
                                  >
                                    <Person />
                                  </IconButton>
                                ),
                              }}
                              fullWidth
                            >
                              <MenuItem value={"Todas"}>Todas</MenuItem>
                              {strCargarSelectEspecialidades}
                            </TextField>
                          </FormControl>
                        </Col>
                        <Col xs={12}>
                          <FormControl variant="filled" margin="dense">
                            <TextField
                              select
                              label="Prestador"
                              name="Prestador"
                              id="cboPrestador"
                              onChange={this.handleChangeSelect}
                              value={
                                this.state.prestadorSelect.codigo === null
                                  ? -1
                                  : this.state.prestadorSelect.codigo
                              }
                              InputProps={{
                                startAdornment: (
                                  <IconButton
                                    fontSize="large"
                                    style={{ color: "#1e58bd" }}
                                    aria-label="Historial de turnos"
                                  >
                                    <Person />
                                  </IconButton>
                                ),
                              }}
                              fullWidth
                            >
                              {strCargarSelectPrestadores}
                            </TextField>
                          </FormControl>
                        </Col>
                      </Row>
                    </CardContent>
                  </Card>
                )}
                <Row>
                  <Col sm={12}>
                    {this.state.horarios === null ||
                    this.state.horarios === {} ||
                    this.state.horarios === "" ? null : this.state.loading ? (
                      <Card className="Card">
                        <CardContent>
                          <Row>
                            <CircularProgress size={50} />
                          </Row>
                        </CardContent>
                      </Card>
                    ) : (
                      <Row xs={12}>{strTablaHorarios}</Row>
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
          </LoadingOverlay>
        )}
      </GridMUI>
    );
  }
}

const ConsultarHorariosRedirect = () => {
  const history = useNavigate();
  return <ConsultarHorarios navigate={history} />;
};

export default ConsultarHorariosRedirect;
