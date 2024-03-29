import { useEffect, useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, Switch } from "react-router-dom";
import Page from "./pages/PageContainer/Page";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/general.css";
import LoginIonic from "./pages/Login/Login";
import PageError from "./pages/PageError/PageError";

setupIonicReact();

const App = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <Switch>
          <Route path="/" exact={true}>
            <Redirect to="/Login" />
          </Route>
          <Route path="/Login" exact={true}>
            <LoginIonic />
          </Route>
          <Route path="/page/" exact={true}>
            <Redirect to="/page/Inicio" />
          </Route>
          <Route path="/page/:name" exact={true}>
            <Page />
          </Route>
          <Route path="/*">
            <PageError motivo="404" />
          </Route>
        </Switch>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
