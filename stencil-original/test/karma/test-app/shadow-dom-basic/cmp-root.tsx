import { Component } from '../../../../dist';


@Component({
  tag: 'shadow-dom-basic-root',
  styles: `
    div {
      background: rgb(255, 255, 0);
    }
  `,
  shadow: true
})
export class ShadowDomBasicRoot {

  render() {
    return (
      <shadow-dom-basic>
        <div>light</div>
      </shadow-dom-basic>
    );
  }

}
