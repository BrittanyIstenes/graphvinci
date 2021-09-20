import SchemaButtons from "./SchemaButtons";
import ModeButton from "./ModeButton";
import SearchBar from "./SearchBar";
export const DEFAULTHEIGHT = 40;
export const DEFAULTWIDTH = 40;
import Visualizer, {states} from "../Visualizer";
import HMenu, {MenuData, Separator} from "./HMenu";

export default class HorizontalMenu extends HMenu {
    constructor(parentDiv) {
        super(parentDiv)
        this.rebuild = false;
        this.schemaButtons = new SchemaButtons(DEFAULTHEIGHT, DEFAULTWIDTH);
        this.lastOffset = 0;
    }

    build() {
        Visualizer.concierge_push.destroy();
        this._get_menu_data();
        super.build()

        if (Visualizer.state === states.Schema) {
            this.searchBar = new SearchBar(this.parentDiv);
            this.searchBar.build();
        }
    }

    update_state() {
        super.update_state(Visualizer.state)
    }

    _get_menu_data() {
        this.data = new MenuData();
        let self = this;
        this.data.add_entry(new Separator(8, DEFAULTHEIGHT, "Entity"));
        this.data.add_entry(new ModeButton(DEFAULTHEIGHT, DEFAULTWIDTH, states.Setup, "images/buttons/setup.png", "Setup Endpoint", () => self._switch_mode(states.Setup)));
        if (Visualizer.config.schemaReady) {
            this.data.add_entry(new Separator(6, DEFAULTHEIGHT, "Entity"));
            this.data.add_entry(new ModeButton(DEFAULTHEIGHT, DEFAULTWIDTH, states.Schema, "images/buttons/schema.png", "GraphVinciSchema Investigator", () => self._switch_mode(states.Schema)));
        }
        this.data.add_entry(new Separator(34, DEFAULTHEIGHT, "Group", 10));
        if (Visualizer.state === states.Schema) {
            for (let button of this.schemaButtons.get_buttons()) {
                this.data.add_entry(button);
            }
        }
    }

    _switch_mode(mode) {
        Visualizer.apply_current_schema();
        Visualizer.set_state(mode);
        this.build();
    }
}
