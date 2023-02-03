import React, { Component } from "react";

export default class Window extends Component {
  render () {
    return (
        <div className="window" onClick={this.props.onClick}>
            <div className="window-content">
                <div className="pane-group">
                    {this.props.children}
                </div>
            </div>

        </div>
    )
  }
} 