import React from "react";
import { mount, render, configure } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';

import Delegate from "../modules/delegate";

configure({ adapter: new Adapter() });

describe("<Delegate />", () => {
  describe("basic render/default API", () => {
    function FunctionalComponent() {
      return <p>Functional</p>;
    }

    class ClassComponent extends React.Component {
      state = {
        label: "Class"
      };

      render() {
        return <p>{this.state.label}</p>;
      }
    }

    it("to prop takes function", () => {
      const delegate = mount(<Delegate to={FunctionalComponent} />);
      const manualCall = mount(<FunctionalComponent />);
      expect(delegate.html()).toEqual(delegate.html());
    });

    it("to prop takes class component", () => {
      const delegate = mount(<Delegate to={ClassComponent} />);
      const manualCall = mount(<ClassComponent />);
      expect(delegate.html()).toEqual(delegate.html());
    });

    it("render prop takes function", () => {
      const delegate = mount(<Delegate render={FunctionalComponent} />);
      const manualCall = mount(<FunctionalComponent />);
      expect(delegate.html()).toEqual(delegate.html());
    });

    it("render prop takes class component", () => {
      const delegate = mount(<Delegate render={ClassComponent} />);
      const manualCall = mount(<ClassComponent />);
      expect(delegate.html()).toEqual(delegate.html());
    });

    it("children prop takes function", () => {
      const delegate = mount(<Delegate>{FunctionalComponent}</Delegate>);
      const manualCall = mount(<FunctionalComponent />);
      expect(delegate.html()).toEqual(delegate.html());
    });

    it("children prop takes class component", () => {
      const delegate = mount(<Delegate>{ClassComponent}</Delegate>);
      const manualCall = mount(<ClassComponent />);
      expect(delegate.html()).toEqual(delegate.html());
    });

    it("renders default when render / children are null", () => {
      const delegate = mount(<Delegate default={ClassComponent} />);
      const manualCall = mount(<ClassComponent />);
      expect(delegate.html()).toEqual(delegate.html());
    });
  });

  describe("delegates using passed props", () => {
    function DefaultComponent({ label }) {
      return <span>{label}</span>;
    }

    DefaultComponent.displayName = "DefaultComponent";

    it("allows user to render default from delegate", () => {
      function MyComponent({ icon, Default }) {
        return <span>{icon} - <Default /></span>
      }

      MyComponent.displayName = "MyComponent";

      const wrapper = mount(
        <Delegate
          to={MyComponent}
          default={DefaultComponent}
          props={{ icon: "search", label: "Find..." }}
        />
      );

      expect(wrapper.html()).toEqual("<span>search - <span>Find...</span></span>");
    });

    it("allows user to render default from delegate with overrides", () => {
      function MyComponent({ icon, Default }) {
        return <span><Default label={icon} /></span>
      }

      MyComponent.displayName = "MyComponent";

      const wrapper = mount(
        <Delegate
          to={MyComponent}
          default={DefaultComponent}
          props={{ icon: "search", label: "Find..." }}
        />
      );

      expect(wrapper.html()).toEqual("<span><span>search</span></span>");
    });

    it("does not pass Default when `passDefault` is false", () => {
      function MyComponent({ Default }) {
        if (!Default) {
          throw new Error("do not have default");
        }

        return <Default />;
      }

      expect(() => (
        render(
          <Delegate
            to={MyComponent}
            default={DefaultComponent}
            passDefault={false}
            props={{ label: "Find..." }}
          />
        )
      )).toThrow("do not have default");
    });
  });

  describe("shallow equals for delegate", () => {
    function DefaultComponent() {
      return <span>hi</span>;
    }

    DefaultComponent.displayName = "DefaultComponent";

    function OtherComponent() {
      return <span>bye</span>;
    }

    OtherComponent.displayName = "OtherComponent";

    it("does not generate when `passDefault` is false", () => {
      const wrapper = mount(
        <Delegate default={DefaultComponent} passDefault={false} />
      );

      expect(wrapper.instance().Default).not.toBeDefined();
    });

    it("does not regenerate intermediate function if default prop is the same", () => {
      const wrapper = mount(
        <Delegate default={DefaultComponent} />
      );

      const firstDefault = wrapper.instance().Default;
      expect(firstDefault).toBeDefined();

      wrapper.setProps({ to: OtherComponent });
      const secondDefault = wrapper.instance().Default;
      expect(firstDefault).toEqual(secondDefault);
    });

    it("regenerates intermediate function if default changes", () => {
      const wrapper = mount(
        <Delegate default={DefaultComponent} />
      );

      const firstDefault = wrapper.instance().Default;
      expect(firstDefault).toBeDefined();

      wrapper.setProps({ default: OtherComponent });
      const secondDefault = wrapper.instance().Default;

      expect(secondDefault).toBeDefined();
      expect(firstDefault).not.toEqual(secondDefault);
    });
  });
});
