import { Tabs } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import React from "react"
import { headerTheme } from '../../components/HeaderTitulo'
import { useLoginStore } from '../store/useLoginStore'
import Colors from "../../constants/Colors"


export default function TabsLayout() {
  const {ultDetalle,mesaDet,ultMesa} = useLoginStore()
  //console.log('cuenta:',mesaDet.length)
  return (
    <>
        <Tabs screenOptions={{ ...headerTheme, tabBarActiveTintColor: Colors.colorazulboton }}>

          <Tabs.Screen
              name="platos"
              options={{
                  tabBarLabel: 'Rubros',
                  headerTitle: 'Rubros',
                  headerTitleStyle: { fontWeight: 'bold' },
                  headerTitleAlign: 'center',
                  headerShown: false,
                  
                  tabBarIcon: ({ color, size }) => <Ionicons name="fast-food-outline" color={color} size={size} />
              }} />

          <Tabs.Screen
              name="cuenta"
              options={{
                  headerTitle: 'Cuenta',
                  tabBarLabel: 'Cuenta',
                  headerTitleAlign: 'center',
                  //tabBarBadge: ultDetalle,
                  tabBarBadge: mesaDet.length,
                  tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={color} size={size} />,
                  href: mesaDet.length  > 0 ? `(tabs)/cuenta/` : null,
                  //href: mesaDet.length > 0 ? `/cuenta/${ultMesa}` : null,
              }} />
            

          <Tabs.Screen
              name="mensajes"
              options={{
                  headerTitle: 'Mensajes',
                  tabBarLabel: 'Mensajes',
                  headerTitleAlign: 'center',
                  //headerShown: false,
                  //href: `/(tabs)/mensajes`,
                  tabBarIcon: ({ color, size }) => <Ionicons name="chatbox-outline" color={color} size={size} />
              }} />      
          
          <Tabs.Screen
              // Name of the route to hide.
              name="index"
              options={{
                  // This tab will no longer show up in the tab bar.
                  href: null,
              }} />

        </Tabs>
      </>
      )
    
}