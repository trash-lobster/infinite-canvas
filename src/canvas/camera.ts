import { ClipSpaceNearZ } from '@antv/g-device-api';
import { mat3, vec2 } from 'gl-matrix';
import { EASING_FUNCTION } from '../utils';

const EPSILON = 0.01;

export interface Landmark {
    zoom: number;
    x: number;
    y: number;
    rotation: number;
}

export class Camera {
    clipSpaceNearZ = ClipSpaceNearZ.NEGATIVE_ONE;

    /**
     * Zoom factor of the camera, default is 1.
     * @see https://threejs.org/docs/#api/en/cameras/OrthographicCamera.zoom
     */
    __zoom = 1;
    __x = 0;
    __y = 0;
    __rotation = 0;
    __width = 0;
    __height = 0;

    /** Matrix in world space. */
    __matrix = mat3.create();

    /** Projection matrix. */
    __projectionMatrix = mat3.create();

    /** Invert matrix in world space. */
    __viewMatrix = mat3.create();

    /** projectionMatrix * viewMatrix */
    __viewProjectionMatrix = mat3.create();

    /** Invert viewProjectionMatrix. */
    __viewProjectionMatrixInv = mat3.create();

    /** Animation ID of landmark animation. */
    __landmarkAnimationID: number;

    constructor(width: number, height: number) {
        this.projection(width, height);
        this.updateMatrix();
    }

    projection(width: number, height: number) {
        this.__width = width;
        this.__height = height;
        mat3.projection(this.__projectionMatrix, width, height);
        this.updateViewProjectionMatrix();
    }

    private updateMatrix() {
        const zoomScale = 1 / this.__zoom;
        mat3.identity(this.__matrix);
        mat3.translate(this.__matrix, this.__matrix, [this.__x, this.__y]);
        mat3.rotate(this.__matrix, this.__matrix, this.__rotation);
        mat3.scale(this.__matrix, this.__matrix, [zoomScale, zoomScale]);
        mat3.invert(this.__viewMatrix, this.__matrix);
        this.updateViewProjectionMatrix();
    }

    private updateViewProjectionMatrix() {
        mat3.multiply(
            this.__viewProjectionMatrix,
            this.__projectionMatrix,
            this.__viewMatrix
        );
        mat3.invert(
            this.__viewProjectionMatrixInv,
            this.__viewProjectionMatrix
        );
    }

    get projectionMatrix() {
        return this.__projectionMatrix;
    }

    get viewMatrix() {
        return this.__viewMatrix;
    }

    get viewProjectionMatrix() {
        return this.__viewProjectionMatrix;
    }

    get viewProjectionMatrixInv() {
        return this.__viewProjectionMatrixInv;
    }

    get matrix() {
        return this.__matrix;
    }

    get zoom() {
        return this.__zoom;
    }
    set zoom(zoom: number) {
        if (this.__zoom !== zoom) {
            this.__zoom = zoom;
            this.updateMatrix();
        }
    }

    get x() {
        return this.__x;
    }
    set x(x: number) {
        if (this.__x !== x) {
            this.__x = x;
            this.updateMatrix();
        }
    }

    get y() {
        return this.__y;
    }
    set y(y: number) {
        if (this.__y !== y) {
            this.__y = y;
            this.updateMatrix();
        }
    }

    get width() {
        return this.__width;
    }
    get height() {
        return this.__height;
    }

    get rotation() {
        return this.__rotation;
    }
    set rotation(rotation: number) {
        if (this.__rotation !== rotation) {
            this.__rotation = rotation;
            this.updateMatrix();
        }
    }

    createLandmark(params: Partial<Landmark> = {}): Landmark {
        return {
            zoom: this.__zoom,
            x: this.__x,
            y: this.__y,
            rotation: this.__rotation,
            ...params,
        };
    }

    gotoLandmark(
        landmark: Landmark,
        options: Partial<{
            easing: string;
            duration: number;
            onframe: (t: number) => void;
            onfinish: () => void;
        }> = {}
    ) {
        const {
            easing = 'linear',
            duration = 100,
            onframe = undefined,
            onfinish = undefined,
        } = options;

        const { zoom, x, y, rotation } = landmark;

        const endAnimation = () => {
            this.__zoom = zoom;
            this.__x = x;
            this.__y = y;
            this.__rotation = rotation;
            this.updateMatrix();
            if (onfinish) {
                onfinish();
            }
        };

        if (duration === 0) {
            endAnimation();
            return;
        }

        this.cancelLandmarkAnimation();

        let timeStart: number | undefined;
        const destPosition: vec2 = [x, y];
        const destZoomRotation: vec2 = [zoom, rotation];

        const animate = (timestamp: number) => {
            if (timeStart === undefined) {
                timeStart = timestamp;
            }
            const elapsed = timestamp - timeStart;

            if (elapsed > duration) {
                endAnimation();
                return;
            }
            // use the same ease function in animation system
            const t = EASING_FUNCTION[easing](elapsed / duration);

            const interPosition = vec2.create();
            const interZoomRotation = vec2.fromValues(1, 0);

            vec2.lerp(interPosition, [this.__x, this.__y], destPosition, t);
            vec2.lerp(
                interZoomRotation,
                [this.zoom, this.__rotation],
                destZoomRotation,
                t
            );

            this.__x = interPosition[0];
            this.__y = interPosition[1];
            this.__zoom = interZoomRotation[0];
            this.__rotation = interZoomRotation[1];
            this.updateMatrix();

            const dist = vec2.dist(interPosition, destPosition);
            if (dist <= EPSILON) {
                endAnimation();
                return;
            }

            if (elapsed < duration) {
                if (onframe) {
                    onframe(t);
                }
                this.__landmarkAnimationID = requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    cancelLandmarkAnimation() {
        if (this.__landmarkAnimationID !== undefined) {
            cancelAnimationFrame(this.__landmarkAnimationID);
        }
    }
}
