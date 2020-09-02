import React from 'react';
import {ImArrowLeft2,ImArrowRight2,ImArrowUp2,ImArrowDown2,ImArrowUpLeft2,
    ImArrowUpRight2,ImArrowDownRight2,ImArrowDownLeft2} from "react-icons/im";
import {GrVulnerability} from 'react-icons/gr';
import {CaretRightOutlined,PauseOutlined, ReloadOutlined, UpOutlined,
    DownOutlined, StopOutlined, CloudUploadOutlined,CloudDownloadOutlined,
    SendOutlined,CheckOutlined,CloseOutlined} from '@ant-design/icons';

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
    "next" : <SendOutlined />
}