import React from 'react';
import {ImArrowLeft2,ImArrowRight2,ImArrowUp2,ImArrowDown2,ImArrowUpLeft2,
    ImArrowUpRight2,ImArrowDownRight2,ImArrowDownLeft2, ImContrast} from "react-icons/im";
import {BsFillBrightnessHighFill, BsDropletHalf} from "react-icons/bs";
import {GrVulnerability} from 'react-icons/gr';
import {IoIosColorFilter, IoIosResize} from 'react-icons/io';
import { MdRotate90DegreesCcw } from "react-icons/md";
import {CaretRightOutlined, PauseOutlined, ReloadOutlined, UpOutlined,
    DownOutlined, StopOutlined, CloudUploadOutlined,CloudDownloadOutlined,
    SendOutlined, CheckOutlined, CloseOutlined, UndoOutlined, RedoOutlined,
    PlusCircleOutlined, DeleteOutlined, CheckCircleOutlined, DragOutlined, BgColorsOutlined} from '@ant-design/icons';

export const icons = {
    "left" : <ImArrowLeft2 />,
    "right" : <ImArrowRight2 />,
    "up" : <ImArrowUp2 />,
    "down" : <ImArrowDown2 />,
    "leftUp" : <ImArrowUpLeft2 />,
    "leftDown" : <ImArrowDownLeft2 />,
    "rightUp" : <ImArrowUpRight2 />,
    "rightDown" : <ImArrowDownRight2 />,
    "fire" : <GrVulnerability />,
    "start" : <CaretRightOutlined />,
    "pause" : <PauseOutlined />,
    "stop" : <StopOutlined />,
    "fpsUp" : <UpOutlined />,
    "fpsDown" :<DownOutlined />,
    "reset" : <ReloadOutlined />,
    "trainOnline" : <CloudUploadOutlined />,
    "trainOffline" : <CloudDownloadOutlined />,
    "good" : <CheckOutlined />,
    "bad" : <CloseOutlined />,
    "next" : <SendOutlined />,
    "brightness" : <BsFillBrightnessHighFill />,
    "contrast" : <ImContrast />,
    "saturation": <BsDropletHalf />,
    "hue": <IoIosColorFilter />,
    "undo": <UndoOutlined />,
    "redo": <RedoOutlined />,
    "addMarker": <PlusCircleOutlined />,
    "resetImage": <DeleteOutlined />,
    "submitImage": <CheckCircleOutlined />,
    "rotateImage": <MdRotate90DegreesCcw />,
    "resizeImage": <IoIosResize />,
    "recolorMarker": <BgColorsOutlined />,
    "moveMarker": <DragOutlined />
}