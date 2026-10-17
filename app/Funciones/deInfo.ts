import { useEffect, useState } from "react";
import { ToastAndroid } from "react-native";

export default function deInfo(){
    return null;
}

export function showToast (msg:string)  {
  
      ToastAndroid.showWithGravity(msg, ToastAndroid.SHORT,ToastAndroid.CENTER,);
     
    
  };