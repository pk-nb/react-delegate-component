import React from "react";
import propTypes from "prop-types";

const { bool, func, object } = propTypes;

function generateDefaultComponent(PassedDefault, props) {
  const Default = (delegateProps = {}) => <PassedDefault {...props} {...delegateProps} />;
  Default.displayName = "Default";

  return Default;
}

class Delegate extends React.Component {
  static displayName = "Delegate";

  static propTypes = {
    to: func,
    render: func,
    default: func,
    props: object,
    passDefault: bool
  };

  static defaultProps = {
    props: {},
    passDefault: true
  };

  constructor(props) {
    super(props);

    // Memoize the renderDefault prop, so that we don't make new functions if the
    // default stays the same. This allows children to take advantage of PureComponent skips
    // if the prop doesn't change.
    if (props.default && props.passDefault) {
      this.Default = generateDefaultComponent(props.default, props.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    // Recompute renderDefault function if necessary
    if (nextProps.passDefault && nextProps.default && this.props.default !== nextProps.default) {
      this.Default = generateDefaultComponent(nextProps.default, nextProps.props);
    }
  }

  render() {
    const { to, render, children, default: Default, passDefault } = this.props;
    const Render = to || render || children;

    if (!Render) {
      return <Default {...this.props.props} />;
    }

    if (!Default || !passDefault) {
      return <Render {...this.props.props} />;
    }

    return <Render Default={this.Default} {...this.props.props} />;
  }
}

export default Delegate;
