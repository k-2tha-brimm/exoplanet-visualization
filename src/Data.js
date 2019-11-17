import React from 'react';
import * as d3 from 'd3';

export default class Data extends React.Component {
    render() {

        d3.csv('/data/exoplanets.csv').then(data => {
            console.log(data);
        });

        return (
            <div>
                <p>Hi</p>
            </div>
        )
    }
}