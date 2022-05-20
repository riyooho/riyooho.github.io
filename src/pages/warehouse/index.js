import React from 'react'
import "./warehouse.scss"

const Warehouse = () => {
    return (
        <div className="container">
            <load>load</load>
            <receipt>receipt</receipt>
            <office>office</office>
            <dispatch>dispatch</dispatch>
            <profile>
                <span className='circle'/>
            </profile>
            <storage>
                <div className='card'>A</div>
                <div className='card'>B</div>
                <div className='card'>C</div>
                <div className='card'>D</div>
                <div className='card'>E</div>
            </storage>
            <picpac>picpac</picpac>
            <facil>©2022 Copyright</facil>
        </div>
    )
}

export default Warehouse