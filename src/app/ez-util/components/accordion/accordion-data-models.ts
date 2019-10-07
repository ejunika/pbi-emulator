import { v1 } from 'uuid';

export class Accordion {
    id: string;
    panels: Array<AccordionPanel>;

    constructor() {
        this.id = `accordion-${v1()}`;
        this.panels = [];
    }

    addPanel(panel: AccordionPanel): Accordion {
        panel.id = `accordion-panel-${v1()}`;
        this.panels.push(panel);
        return this;
    }

}

export class AccordionPanel {
    id: string;
    headerText: string;
    body: any;

    constructor(headerText: string, body: any) {
        this.headerText = headerText;
        this.body = body;
    }
}
