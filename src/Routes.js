import React from "react"
import { Route, Switch } from "react-router"
import Main from './main';

const Routes = () => {
    return (
        <Switch>
            <Route exact path="/" component={Main} />
        </Switch>
        )
    }
      
export default Routes