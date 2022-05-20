import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { About, Dashboard, Warehouse } from '../../pages'

const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route path="/warehouse">
                    <Warehouse/>
                </Route>
                <Route path="/dashboard">
                    <Dashboard/>
                </Route>
                <Route path="/">
                    <About/>
                </Route>
            </Switch>
        </Router>
    )
}

export default Routes
