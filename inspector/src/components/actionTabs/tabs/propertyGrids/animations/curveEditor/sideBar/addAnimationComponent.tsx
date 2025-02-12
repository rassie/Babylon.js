import * as React from "react";
import { GlobalState } from "../../../../../../globalState";
import { Context } from "../context";
import { Animation } from "babylonjs/Animations/animation";
import { Quaternion, Vector2, Vector3 } from "babylonjs/Maths/math.vector";
import { IAnimationKey } from "babylonjs/Animations/animationKey";
import { Color3, Color4 } from "babylonjs/Maths/math.color";

interface IAddAnimationComponentProps {
    globalState: GlobalState;
    context: Context;
}

interface IAddAnimationComponentState {
}

export class AddAnimationComponent extends React.Component<
IAddAnimationComponentProps,
IAddAnimationComponentState
> {
    private _root: React.RefObject<HTMLDivElement>;
    private _displayName: React.RefObject<HTMLInputElement>;
    private _property: React.RefObject<HTMLInputElement>;
    private _typeElement: React.RefObject<HTMLSelectElement>;
    private _loopModeElement: React.RefObject<HTMLSelectElement>;

    constructor(props: IAddAnimationComponentProps) {
        super(props);

        this.state = { };

        this._root = React.createRef();
        this._displayName = React.createRef();
        this._property = React.createRef();
        this._typeElement = React.createRef();
        this._loopModeElement = React.createRef();
    }

    public createNew() {        
        const context = this.props.context;
        const document = this._displayName.current!.ownerDocument;
        const displayName = this._displayName.current!.value;
        const property = this._property.current!.value;
        const type = this._typeElement.current!.value;
        const loopModeValue = this._loopModeElement.current!.value;

        if (!displayName) {
            document.defaultView!.alert("Please define a display name");
            return;
        }

        if (!property) {
            document.defaultView!.alert("Please define a property");
            return;
        }
        
        const fps = this.props.context.animations && this.props.context.animations.length ? this.props.context.animations[0].framePerSecond : 60;
        let dataType = 0;
        let loopMode = 0;
        let defaultValue: any;

        switch (type) {
            case "Float": {
                dataType = Animation.ANIMATIONTYPE_FLOAT;
                defaultValue = 0;
                break;
            }
            case "Vector2": {
                dataType = Animation.ANIMATIONTYPE_VECTOR2;
                defaultValue = Vector2.Zero();
                break;
            }
            case "Vector3": {
                dataType = Animation.ANIMATIONTYPE_VECTOR3;
                defaultValue = Vector3.Zero();
                break;
            }
            case "Quaternion": {
                dataType = Animation.ANIMATIONTYPE_QUATERNION;
                defaultValue = Quaternion.Zero();
                break;
            }
            case "Color3": {
                dataType = Animation.ANIMATIONTYPE_COLOR3;
                defaultValue = Color3.Black();
                break;
            }                                                
            case "Color4": {
                dataType = Animation.ANIMATIONTYPE_COLOR4;
                defaultValue = new Color4(0, 0, 0, 0);
                break;
            }            
        }

        switch (loopModeValue) {
            case "Cycle": {
                loopMode = Animation.ANIMATIONLOOPMODE_CYCLE;
                break;
            }
            case "Relative": {
                loopMode = Animation.ANIMATIONLOOPMODE_RELATIVE;
                break;
            }
            case "Constant": {
                loopMode = Animation.ANIMATIONLOOPMODE_CONSTANT;
                break;
            }
        }

        let animation = new Animation(displayName, property, fps, dataType, loopMode);
        let keys: IAnimationKey[] = [];
        keys.push({
            frame: context.referenceMinFrame,
            value: defaultValue
        });

        keys.push({
            frame: context.referenceMaxFrame,
            value: defaultValue
        });

        animation.setKeys(keys);

        context.stop();

        if (!context.animations || context.animations.length === 0) {
            context.animations = [];            
            context.target.animations = context.animations;
        }

        context.animations.push(animation);
        context.activeAnimation = animation;
        context.prepare();
        context.onActiveAnimationChanged.notifyObservers();            
        context.onAnimationsLoaded.notifyObservers();
    }

    public render() {

        const types = ["Float", "Vector2", "Vector3", "Quaternion", "Color3", "Color4"];
        const loopModes = ["Cycle", "Relative", "Constant"];

        return (
            <div id="add-animation-pane" ref={this._root}>
                <div id="add-animation-display-name-label">
                    Display Name
                </div>
                <div id="add-animation-property-label">
                    Property
                </div>                
                <div id="add-animation-type-label">
                    Type
                </div>
                <div id="add-animation-loop-mode-label">
                    Loop Mode
                </div>
                <input type="text" id="add-animation-name" ref={this._displayName} className="input-text" defaultValue=""/>
                <input type="text" id="add-animation-property" ref={this._property} className="input-text" defaultValue=""/>
                <select id="add-animation-type" className="option" ref={this._typeElement}>
                    {types.map((type, i) => {
                        return (
                            <option key={type + i} value={type} title={type}>
                                {type}
                            </option>
                        );
                    })}
                </select>
                <select id="add-animation-loop-mode" className="option" ref={this._loopModeElement}>
                    {loopModes.map((loopMode, i) => {
                        return (
                            <option key={loopMode + i} value={loopMode} title={loopMode}>
                                {loopMode}
                            </option>
                        );
                    })}
                </select>
                <button className="simple-button" id="add-animation" type="button" onClick={() => this.createNew()}>
                    Create
                </button>              
            </div>
        );
    }
}