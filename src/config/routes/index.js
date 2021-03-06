import React from 'react'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { About, Dashboard, Warehouse, DHoliday } from '../../pages'

const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route path="/notion/holidate">
                    <DHoliday/>
                </Route>
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
