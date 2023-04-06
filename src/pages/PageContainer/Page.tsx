import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonRouterOutlet,
  IonSplitPane,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Route, useParams } from "react-router";
import ExploreContainer from "../../components/ExploreContainer/ExploreContainer";
import Menu from "../../components/Menu/Menu";
import "./Page.css";

const Page = () => {
  const { name } = useParams<{ name: string }>();

  return (
    <IonSplitPane contentId="main">
      <Menu />
      <IonRouterOutlet id="main">
        <Route path="/page/:name" exact={true}>
          <IonPage>
            <IonHeader>
              <IonToolbar>
                <IonButtons slot="start">
                  <IonMenuButton />
                </IonButtons>
                <IonTitle>{name}</IonTitle>
              </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
              <IonHeader collapse="condense">
                <IonToolbar>
                  <IonTitle size="large">{name}</IonTitle>
                </IonToolbar>
              </IonHeader>
              <ExploreContainer name={name} />
            </IonContent>
          </IonPage>
        </Route>
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

export default Page;
