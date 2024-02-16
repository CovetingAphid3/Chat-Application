import {MultiChatSocket,MultiChatWindow,useMultiChatLogic} from "react-chat-engine-advanced"


const ChatsPage = (props) => {
  const chatProps = useMultiChatLogic(
    'e729b712-a2b3-426d-9765-bcdc0bd2e825',
    props.user.username,
    props.user.secret)
  return (
    <div style={{height:'100vh'}}>
      <MultiChatSocket {...chatProps}/>
      <MultiChatWindow {...chatProps} style={{heigh:'100%'}}/>
    </div>
  )
}

export default ChatsPage