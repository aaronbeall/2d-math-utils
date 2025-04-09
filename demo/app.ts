import { html, render } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { demos } from './pages/index';
import { clearCanvas } from './utils';

function renderNav(currentSection: string, currentMethod?: string) {
  return html`
    <div class="demo-nav">
      <div class="section-nav">
        ${Object.keys(demos).map(section => html`
          <a href="#${section}" class="${section === currentSection ? 'active' : ''}">${section}</a>
        `)}
      </div>
      <div class="method-nav">
        ${currentSection && demos[currentSection] && 
          Object.keys(demos[currentSection]).map(method => html`
            <a href="#${currentSection}/${method}" 
               class="${method === currentMethod ? 'active' : ''}">${method}</a>
          `)
        }
      </div>
    </div>
  `;
}

function renderDemo(section: string, method?: string) {
  return html`
    ${renderNav(section, method)}
    ${repeat([Date.now()], (id) => id, () => 
      html`<canvas width="800" height="600"></canvas>`
    )}
  `;
}

function route() {
  const [section = 'point', method] = location.hash.slice(1).split('/');
  const demo = document.getElementById('demo')!;
  
  render(renderDemo(section, method), demo);
  
  const canvas = demo.querySelector('canvas')!;
  clearCanvas(canvas.getContext('2d')!);
  
  if (method && demos[section]?.[method]) {
    demos[section][method](canvas);
  }
}

window.addEventListener('hashchange', route);
route();
