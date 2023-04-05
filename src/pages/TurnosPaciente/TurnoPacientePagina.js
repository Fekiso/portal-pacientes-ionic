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
  ExpandMore,
  Person,
  SearchOutlined,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import axios from "axios";
import LoadingOverlay from "react-loading-overlay";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton/CustomButton";
import ModalFiltro from "../components/ModalFiltro/ModalFiltro";
LoadingOverlay.propTypes = undefined;

var token = "";
var urlRest = "";

const CustomAlert = (props) => {
  return <Alert elevation={6} variant="filled" {...props} />;
};

const Item = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

class TurnosPaciente extends Component {
  constructor() {
    super();
    this.state = {
      UsuarioLogueado: null,
      snackbar: {
        snackbarOpen: false,
        snackbarText: null,
        snackbarColor: "black",
      },
      turnoAgenda: null,
      turnoSeleccionado: {},
      msjConfirmar: false,
      loading: false,
      mobileOpen: false,
      pacienteNombre: "",
      pacienteApellido: "",
      pacienteDni: "",
      pacienteCodigo: "",
      pacienteMutual: "",
      observacion: "",
      pacienteCargando: false,
      codigoTurno: null,
      turnoSel: null,
      filtrarAsistidos: null,
      filtrarCancelados: null,
      filtrarPorEspecialidad: null,
      abrirModalFiltros: false,
      abrirMenuCuenta: null,
      turnosMostrar: [],
      prestadorSelect: { codigo: null, nombre: "" },
      especialidadSelect: { codigo: null, nombre: "" },
      especialidades: [],
      prestadores: [],
    };
    this.traerTurnosPaciente = this.traerTurnosPaciente.bind(this);
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
    let session = JSON.parse(sessionStorage.getItem("UsuarioLogueado"));

    const UsuarioLogueado = JSON.parse(
      sessionStorage.getItem("UsuarioLogueado")
    );

    if (UsuarioLogueado === null) {
      this.setState({
        UsuarioLogueado: this.props.location.Usuario,
        fechaSelect: moment().format("YYYY-MM-DD"),
      });
      this.traerTurnosPaciente(UsuarioLogueado);
    } else {
      this.setState({ UsuarioLogueado: UsuarioLogueado });
      this.traerTurnosPaciente(UsuarioLogueado);
    }
    this.traerPrestadores();
    this.traerEspecialidades();
    this.handleChangeSelectEspecialidad(-1);
  }

  async traerTurnosPaciente(paciente) {
    let Turnos = null;
    let servicio = null;
    var config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    if (paciente !== null) {
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
        await axios
          .get(
            `${urlRest}Turnos/TurnosPaciente/?paciente=${paciente.codigo}&servicio=${servicio[0].codigo}`,
            config
          )
          .then((response) => {
            if (response.data.length !== 0) {
              Turnos = response.data;
            } else {
              Turnos = null;
            }
          })
          .catch((e) => {
            console.log("Error");
            console.log(e.response);
            this.setState({ loading: false });
          });
      }
      if (Turnos === null) {
        this.snackbarEstado(true, "No hay turnos registrados", "Error");
      }
      servicio = null;
      this.setState({
        turnoAgenda: Turnos,
        loading: false,
      });
    }
  }

  async CancelarTurno(turno) {
    let cancelarTurnoEstado = 0;
    // let servicio = null;

    let respuesta = "";
    var config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    if (turno !== null) {
      this.setState({ loading: true });
      // await axios
      //   .get(`${urlRest}Servicios`, config)
      //   .then((response) => {
      //     if (response.data.length !== 0) {
      //       servicio = response.data;
      //     } else {
      //       servicio = null;
      //     }
      //   })
      //   .catch((e) => {
      //     console.log("Error");
      //     console.log(e.response);
      //     this.setState({ loading: false });
      //   });

      // if (servicio.codigo !== null) {
      await axios
        .patch(`${urlRest}Turnos/Quitar/${turno.codigo}`, "", config)
        .then(function (response) {
          cancelarTurnoEstado = response.status;
          respuesta = response.data;
        })
        .catch(function (error) {
          console.log("Error");
          console.log(error.response);
        });
      // }

      if (cancelarTurnoEstado === 200) {
        if (respuesta === "OK") {
          this.setState({
            msjTurnoConfirmadoMsj: "El turno se cancelo correctamente",
            msjTurnoConfirmado: true,
            turnoAgenda: null,
          });
        } else {
          this.setState({
            msjTurnoConfirmadoMsj: respuesta,
            msjTurnoConfirmado: true,
          });
        }
      } else {
        if (cancelarTurnoEstado === 500) {
          this.setState({
            msjTurnoConfirmadoMsj:
              "Ocurrio un error al realizar la operacion, por favor reintentelo nuevamente",
            msjTurnoConfirmado: true,
          });
        } else {
          this.setState({
            msjTurnoConfirmadoMsj:
              "Error al cancelar turno,por favor intentelo nuevamente en unos minutos",
            msjTurnoConfirmado: true,
          });
        }
      }
    }
  }

  CerrarmsjConfirmar = () => {
    this.setState({ msjConfirmar: false, codigoTurno: null, turnoSel: null });
  };

  DarBajaTurno = (turno) => {
    if (this.state.UsuarioLogueado.codigo === null) {
      this.snackbarEstado(true, "Debe ingresar un paciente", "Error");
    } else {
      this.setState({
        msjConfirmar: true,
        codigoTurno: turno.codigo,
        turnoSeleccionado: turno,
      });
    }
  };

  ConfirmarmsjConfirmar = () => {
    this.CancelarTurno(this.state.turnoSeleccionado).then(() => {
      this.CerrarmsjConfirmar();
      this.traerTurnosPaciente(this.state.UsuarioLogueado);
    });
  };

  handleClickRefrescar = () => {
    this.traerTurnosPaciente(this.state.UsuarioLogueado);
  };

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

  abrirCerrarMenuFiltros(event) {
    this.setState({
      abrirModalFiltros: !this.state.abrirModalFiltros,
    });
  }

  handleChangeSelect = (event) => {
    if (event.target.name === "Especialidad") {
      this.handleChangeSelectPrestador(null);
      this.handleChangeSelectEspecialidad(event.target.value);
    } else if (event.target.name === "Prestador") {
      this.handleChangeSelectEspecialidad(this.state.especialidadSelect.codigo);
      this.handleChangeSelectPrestador(event.target.value);
    }
    if (event.target.name === "Asistido") {
      this.setState({ filtrarAsistidos: event.target.value });
    }
    if (event.target.name === "Cancelado") {
      this.setState({ filtrarCancelados: event.target.value });
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

    const especialidadSelect = { codigo: codigo, nombre: nombre };

    this.setState({
      especialidadSelect: especialidadSelect,
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

    const prestadorSelect = { codigo: codigo, nombre: nombre };

    this.setState({
      prestadorSelect: prestadorSelect,
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

  filtrarPrestadores(arrPrestadores) {
    let listaPrestadores = [];
    let nuevaLista = [];
    listaPrestadores = this.state.prestadores;
    // if (
    //   this.state.especialidadSelect !== {} &&
    //   this.state.especialidadSelect.codigo !== null &&
    //   this.state.especialidadSelect.codigo !== -1
    // ) {
    //   listaPrestadores.map((prestador) => {
    //     if (prestador.especialidad === this.state.especialidadSelect.codigo) {
    //       nuevaLista.push(prestador);
    //     }
    //   });
    // } else {
      listaPrestadores.map((prestador) => {
        nuevaLista.push(prestador);
      });
    // }

    listaPrestadores = nuevaLista;
    nuevaLista = [];

    //iteramos la lista de especialidades de los turnos
    arrPrestadores.map((prestadorMostrar) => {
      //en cada vuelta buscamos la especialidad entre las disponibles
      listaPrestadores.map((prestador) => {
        if (prestadorMostrar === prestador.codigo)
          //pusheamos en la nueva lista las especialidades disponiblesa que coincidan con las que se deben mostrar
          nuevaLista.push(prestador);
      });
    });

    return nuevaLista;
  }

  filtrarEspecilidades(arrEspecialidades) {
    let listaEspecialidades = [];
    let nuevaLista = [];

    listaEspecialidades = this.state.especialidades;

    //iteramos la lista de especialidades de los turnos
    arrEspecialidades.map((especialidadMostrar) => {
      //en cada vuelta buscamos la especialidad entre las disponibles
      listaEspecialidades.map((especialidad) => {
        // if (especialidadMostrar === especialidad.codigo)
          //pusheamos en la nueva lista las especialidades disponiblesa que coincidan con las que se deben mostrar
          nuevaLista.push(especialidad);
      });
    });

    return nuevaLista;
  }

  aplicarFiltros = (turnos) => {
    let nuevaLista = turnos;
    
    if (
      this.state.filtrarAsistidos !== "todos" &&
      this.state.filtrarAsistidos !== null &&
      this.state.filtrarAsistidos !== -1
    ) {
      nuevaLista = nuevaLista.filter(
        ({ asistio }) => asistio === this.state.filtrarAsistidos
      );
    }
    if (
      this.state.filtrarCancelados !== "todos" &&
      this.state.filtrarCancelados !== null &&
      this.state.filtrarCancelados !== -1
    ) {
      nuevaLista = nuevaLista.filter(
        ({ aCancelar }) => aCancelar === this.state.filtrarCancelados
      );
    }
    if (
      this.state.especialidadSelect.nombre !== "todas" &&
      this.state.especialidadSelect.codigo !== -1
    ) {
      nuevaLista = nuevaLista.filter(
        ({ especialidad }) =>
          especialidad === this.state.especialidadSelect.codigo
      );
    }
    if (
      this.state.prestadorSelect.nombre !== "" &&
      this.state.prestadorSelect.codigo !== null
    ) {
      nuevaLista = nuevaLista.filter(
        ({ prestadorCod }) => prestadorCod === this.state.prestadorSelect.codigo
      );
    }
    return nuevaLista;
  };

  render() {
    var strToComponentsTurnos = null;
    let especialidadesTurnos = [];
    let prestadoresTurnos = [];
    if (
      this.state.UsuarioLogueado !== null &&
      this.state.turnoAgenda !== null
    ) {
      strToComponentsTurnos = this.aplicarFiltros(this.state.turnoAgenda).map(
        (turno, i) => {
          especialidadesTurnos.push(turno.especialidad);
          prestadoresTurnos.push(turno.prestadorCod);
          return (
            <TableRow padding="none" key={turno.codigo}>
              <TableCell component="th" align="center">
                <Typography variant="caption">
                  {`${moment(turno.fecha).format("DD/MM/YYYY")} ${moment(
                    turno.hora
                  ).format("HH:mm")}`}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="caption">{turno.prestadorNom}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="caption">{turno.mutualNom}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="caption">
                  {turno.aCancelar ? "Si" : "No"}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="caption">
                  {turno.asistio ? "Si" : "No"}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {!moment(moment().format()).isAfter(
                  moment(
                    `${moment(turno.fecha).format("L")} ${moment(
                      turno.hora
                    ).format("LTS")}`
                  ).format()
                ) ? (
                  <IconButton
                    onClick={() => this.DarBajaTurno(turno)}
                    aria-label="CancelarTurno"
                  >
                    <Close fontSize="large" />
                  </IconButton>
                ) : null}
              </TableCell>
            </TableRow>
          );
        }
      );
    } else {
      strToComponentsTurnos = null;
    }

    if (this.state.prestadores !== null) {
      var strCargarSelectPrestadores = this.filtrarPrestadores(
        prestadoresTurnos.unicos()
      ).map((option, i) => {
        return (
          <MenuItem key={i} value={option.codigo}>
            <Typography variant="body1">{option.nombre}</Typography>
          </MenuItem>
        );
      });
      if (this.state.especialidades !== null) {
        var strCargarSelectEspecialidades = this.filtrarEspecilidades(
          especialidadesTurnos.unicos()
        ).map((option, i) => {
          return (
            <MenuItem key={i} value={option.codigo}>
              <Typography variant="body1">{option.nombre}</Typography>
            </MenuItem>
          );
        });
      }
    }

    return (
      <GridMUI container>
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
              <Col xs={12} md={12}>
                {this.state.loading ? (
                  <div className="TurnoPacienteLoading">
                    <CircularProgress size={80} className="buttonProgress" />
                  </div>
                ) : (
                  <Card className="banner">
                    <CardContent>
                      <Row between="xs">
                        <GridMUI item xs={4} style={{ padding: "0" }}>
                          <Item>
                            <Typography variant="h6" gutterBottom>
                              Mis Turnos
                            </Typography>
                          </Item>
                        </GridMUI>
                        <GridMUI item xs="auto" />
                        <GridMUI item style={{ padding: "none" }}>
                          <Item>
                            <Button
                              fontSize="medium"
                              size="medium"
                              fullWidth
                              name="Menu"
                              startIcon={<SearchOutlined fontSize="medium" />}
                              onClick={(e) => this.abrirCerrarMenuFiltros(e)}
                            >
                              <Typography variant="body1" gutterBottom>
                                Filtrar
                              </Typography>
                            </Button>
                          </Item>
                        </GridMUI>
                      </Row>
                      <Accordion expanded={this.state.abrirModalFiltros}>
                        <div />
                        <AccordionDetails>
                          <Row around="xs">
                            <Col xs={12} md={6}>
                              {/* especialidad */}
                              <Row>
                                <FormControl margin="dense">
                                  <TextField
                                    select
                                    label="Especialidad"
                                    name="Especialidad"
                                    id="cboEspecialidad"
                                    onChange={(e) => this.handleChangeSelect(e)}
                                    value={
                                      this.state.especialidadSelect.codigo ===
                                      null
                                        ? -1
                                        : this.state.especialidadSelect.codigo
                                    }
                                    // InputProps={{
                                    //   startAdornment: (
                                    //     <IconButton
                                    //       fontSize="small"
                                    //       style={{ color: "#1e58bd" }}
                                    //       aria-label="Historial de turnos"
                                    //     >
                                    //       <Person />
                                    //     </IconButton>
                                    //   ),
                                    // }}
                                    fullWidth
                                    margin="dense"
                                    variant="outlined"
                                  >
                                    <MenuItem value={-1}>Todas</MenuItem>
                                    {strCargarSelectEspecialidades}
                                  </TextField>
                                </FormControl>
                              </Row>
                            </Col>
                            <Col xs={12} md={6}>
                              {/* prestador */}
                              <Row>
                                <FormControl margin="dense">
                                  <TextField
                                    select
                                    label="Prestador"
                                    name="Prestador"
                                    id="cboPrestador"
                                    onChange={(e) => this.handleChangeSelect(e)}
                                    value={
                                      this.state.prestadorSelect.codigo === null
                                        ? -1
                                        : this.state.prestadorSelect.codigo
                                    }
                                    // InputProps={{
                                    //   startAdornment: (
                                    //     <IconButton
                                    //       fontSize="small"
                                    //       style={{ color: "#1e58bd" }}
                                    //       aria-label="Historial de turnos"
                                    //     >
                                    //       <Person />
                                    //     </IconButton>
                                    //   ),
                                    // }}
                                    margin="dense"
                                    fullWidth
                                    variant="outlined"
                                  >
                                    <MenuItem value={-1}>Todos</MenuItem>
                                    {strCargarSelectPrestadores}
                                  </TextField>
                                </FormControl>
                              </Row>
                            </Col>
                            <Col xs={12} md={6}>
                              {/* cancelados */}
                              <Row>
                                <FormControl margin="dense">
                                  <TextField
                                    select
                                    label="Cancelado"
                                    name="Cancelado"
                                    id="cboCancelados"
                                    onChange={(e) => this.handleChangeSelect(e)}
                                    value={this.state.filtrarCancelados}
                                    fullWidth
                                    margin="dense"
                                    variant="outlined"
                                  >
                                    <MenuItem value="todos">
                                      <Typography variant="body1">
                                        Todos
                                      </Typography>
                                    </MenuItem>
                                    <MenuItem value={false}>
                                      <Typography variant="body1">
                                        No cancelados
                                      </Typography>
                                    </MenuItem>
                                    <MenuItem value={true}>
                                      <Typography variant="body1">
                                        Solo cancelados
                                      </Typography>
                                    </MenuItem>
                                  </TextField>
                                </FormControl>
                              </Row>
                            </Col>
                            <Col xs={12} md={6}>
                              {/* asistidos */}
                              <Row>
                                <FormControl margin="dense">
                                  <TextField
                                    select
                                    label="Asistido"
                                    name="Asistido"
                                    id="cboAsistidos"
                                    onChange={(e) => this.handleChangeSelect(e)}
                                    value={this.state.filtrarAsistidos}
                                    // InputProps={{
                                    //   startAdornment: (
                                    //     <IconButton
                                    //       fontSize="small"
                                    //       style={{ color: "#1e58bd" }}
                                    //       aria-label="Historial de turnos"
                                    //     >
                                    //       <Person />
                                    //     </IconButton>
                                    //   ),
                                    // }}
                                    margin="dense"
                                    fullWidth
                                    variant="outlined"
                                  >
                                    <MenuItem value="todos">
                                      <Typography variant="body1">
                                        Todos
                                      </Typography>
                                    </MenuItem>
                                    <MenuItem value={true}>
                                      <Typography variant="body1">
                                        Solo asistidos
                                      </Typography>
                                    </MenuItem>
                                    <MenuItem value={false}>
                                      <Typography variant="body1">
                                        Solo inasistidos
                                      </Typography>
                                    </MenuItem>
                                  </TextField>
                                </FormControl>
                              </Row>
                            </Col>
                          </Row>
                        </AccordionDetails>
                      </Accordion>
                      <Row>
                        <Col xs={12}>
                          {this.state.turnoAgenda === null ? (
                            <Row xs={12} md={6} lg={4} center="xs" middle="xs">
                              <TableContainer>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell align="center">
                                        No tiene turnos registrados
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                </Table>
                              </TableContainer>
                            </Row>
                          ) : (
                            <Row xs={12} md={6} lg={4} center="xs" middle="xs">
                              {this.state.loading ? (
                                <CircularProgress size={50} />
                              ) : (
                                <TableContainer>
                                  <Table
                                    size="small"
                                    aria-label="a dense table"
                                  >
                                    <TableHead>
                                      <TableRow>
                                        <TableCell align="center">
                                          <Typography variant="caption">
                                            Fecha
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography variant="caption">
                                            Prestador
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography variant="caption">
                                            Mutual
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography variant="caption">
                                            Cancelado
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography variant="caption">
                                            Asitido
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Typography variant="caption">
                                            Acciones
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>

                                    <TableBody>
                                      {strToComponentsTurnos}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              )}
                            </Row>
                          )}
                        </Col>
                      </Row>
                    </CardContent>
                  </Card>
                )}
              </Col>
            </Row>

            {this.state.msjConfirmar ? (
              <MarcoConfirmarCancelarTurno
                AbrirMsjConfirmar={this.state.msjConfirmar}
                turnoSeleccionado={this.state.turnoSeleccionado}
                CerrarmsjConfirmar={this.CerrarmsjConfirmar}
                ConfirmarmsjConfirmar={this.ConfirmarmsjConfirmar}
              />
            ) : null}

            {/* {this.state.abrirModalFiltros ? (
              <ModalFiltro
                modalExt={this.state.abrirModalFiltros}
                onclickModal={this.cerrarModal}
                component="FiltroTurnosPaciente"
                titulo="Filtrar turnos del paciente"
                filtroAsistidos={this.state.filtrarAsistidos}
                filtroCancelados={this.state.filtrarCancelados}
                filtroEspecialidad={this.state.filtrarPorEspecialidad}
                // filtroPrestador={this.state.filtrarPorPrestador}
                aplicarFiltros={(e) => this.handleClickAplicarFiltros()}
              />
            ) : null} */}
          </LoadingOverlay>
        )}
      </GridMUI>
    );
  }
}

const TurnosPacienteRedirect = () => {
  const history = useNavigate();
  return <TurnosPaciente navigate={history} />;
};

export default TurnosPacienteRedirect;
