
import './App.css';
import Web3 from 'web3';
import { useCallback, useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import {loadContract} from './utils/load-contract'
import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import AddBoxIcon from '@mui/icons-material/AddBox';
import GetAppIcon from '@mui/icons-material/GetApp';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
  })

  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);
  const [ethereumAccount, setEthereumAccount] = useState(null);
  const [listSessionOpen,setListSessionOpen] = useState([])
  const [value, setValue] = React.useState(0);
  const [products,setProducts] = useState([]);

  const [nameSession,setNameSession] = useState("")
  const [nameProduct,setNameProduct] = useState("")
  const [priceProduct,setPriceProduct] = useState("")
  const [linkProduct,setLinkProduct] = useState("")
 
  const [addressOwner,setAddressOwner] = useState("")
  const [sessionId,setSessionId] = useState("")
  const [isAccept,setIsAccept] = useState(false)
  const [secret,setSecret] = useState("")
  
  const [myListSession,setMyListSession] = useState([])

  const [currentSession,setCurrentSession] = useState({ownerSession:null,sessionId:null,products:[]})
  
  const [upPrice,setUpPrice] = useState(0)

  useEffect(() => {
    if(window.ethereum){
      //check if Metamask wallet is installed
      setIsMetamaskInstalled(true);
    }
  },[]);

  useEffect(()=>{
    const loadProvider = async ()=>{
      const provider = await detectEthereumProvider();
      const contract = await loadContract('Auction', provider)
      if(provider){
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract
        })
      }else{
        console.error("Please, Install Metamask");
      }
    }
    loadProvider()
    }, [])
  
   //Does the User have an Ethereum wallet/account?
 async function connectMetamaskWallet() {
  //to get around type checking
  window.ethereum
    .request({
        method: "eth_requestAccounts",
    })
    .then((accounts) => {
      setEthereumAccount(accounts[0]);
    })
    .catch((error) => {
        alert(`Something went wrong: ${error}`);
    });
}

const getMyRoom = useCallback(async ()=>{
  const rooms = await web3Api.contract.rooms(ethereumAccount);
  console.log(rooms); 
})

const createSession = useCallback(async (name, products)=>{
  await web3Api.contract.createSession(name,products,{from: ethereumAccount})
}, [ethereumAccount, web3Api]);

const getProductBySession = useCallback(async (ownerSession, sessionId)=>{
  const products = await web3Api.contract.getProductBySession(ownerSession,sessionId)
  setCurrentSession({
    ownerSession,
    sessionId,
    products
  })
},[web3Api])

const getListSessionOpen = useCallback(async ()=>{
  const sessionOpen = await web3Api.contract.getListSessionOpen()
  setListSessionOpen(sessionOpen)
}, [web3Api])
const getMyListSession = useCallback(async ()=>{
  const result = await web3Api.contract.getMyListSession({from: ethereumAccount});
  setMyListSession(result)
}, [web3Api,ethereumAccount])

const confirmSession = useCallback(async (addressOwner, sessionId, isAccept, secret)=>{
   await web3Api.contract.confirmSession(addressOwner,sessionId,isAccept,secret,{from: ethereumAccount});
}, [ethereumAccount,web3Api])

const openSession = useCallback(async (sessionId)=>{
  await web3Api.contract.openSession(sessionId, {from: ethereumAccount})
}, [web3Api, ethereumAccount])

const closeSession = useCallback(async (sessionId, index)=>{
  await web3Api.contract.closeSession(sessionId, index, {from: ethereumAccount})
}, [web3Api, ethereumAccount])

const upPriceProduct = useCallback(async (ownerProduct, sessionId, productId, price)=>{
  await web3Api.contract.upPriceProduct(ownerProduct, sessionId, productId,  web3Api.web3.utils.toWei(`${price}`,'ether'), {from: ethereumAccount, value: web3Api.web3.utils.toWei(`${price}`,'ether')})
}, [web3Api, ethereumAccount])

if (ethereumAccount === null) {
  return (
    <div className="App App-header">
      {
        isMetamaskInstalled ? (
          <div>
            <button onClick={connectMetamaskWallet}>Connect Your Metamask Wallet</button>
          </div>
        ) : (
          <p>Install Your Metamask wallet</p>
        )
      }
    </div>
  );
}

return (
  <div className="App">
    <Box sx={{ width: '100%' }}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction label="Create Session" icon={<AddBoxIcon />} />
        <BottomNavigationAction label="Get List Session" icon={<GetAppIcon />} onClick={() => {getListSessionOpen()}} />
        <BottomNavigationAction label="My Session" icon={<ArrowDownwardIcon />} onClick={()=> {getMyListSession()}}/>
        <BottomNavigationAction label="Confirm session" icon={<CheckIcon />} />
      </BottomNavigation>
    </Box>
    <div>eth: {ethereumAccount}</div>
    {value === 0 && 
      <div style={{
        margin: '30px'
        }}>
        <div>
          <TextField
            style={{
              margin: "0 15px 0 0"
            }}
            onChange={(e)=>{setNameSession(e.target.value)}}
            required
            id="outlined-required"
            label="Name session"
            value={nameSession}
          />
        </div>
        <div style={{
        margin: '20px'
        }}>
          <TextField
            style={{
              margin: "0 15px 0 0"
            }}
            onChange={(e)=>{setNameProduct(e.target.value)}}
            required
            id="outlined-required"
            label="Name"
            value={nameProduct}
          />
          <TextField
            style={{
              margin: "0 15px 0 0"
            }}
            onChange={(e)=>{setPriceProduct(e.target.value)}}
            required
            id="outlined-required"
            label="Price"
            value={priceProduct}
          />
          <TextField
            style={{
              margin: "0 15px 0 0"
            }}
            onChange={(e)=>{setLinkProduct(e.target.value)}}
            required
            id="outlined-required"
            label="Link"
            value={linkProduct}
          />
        <Fab color="primary" aria-label="add">
          <AddIcon onClick={()=>{
            if(nameProduct==="" || priceProduct === "" || linkProduct === "") return
            products.push([nameProduct,web3Api.web3.utils.toWei(`${priceProduct}`,'ether'),linkProduct])
            setNameProduct("")
            setPriceProduct("")
            setLinkProduct("")
          }} />
        </Fab>
        </div>
        <Button variant="outlined" onClick={()=>{
          if(nameSession === "") {
            console.log("fail create session");
            return
          }
          createSession(nameSession,products)
          console.log("create session success");
          setNameSession("")
          setProducts([])
        }}>Craete A Session</Button>
      </div>
    }

    { value === 1 &&
      <div>
        <h4>List session</h4>
        <div style={{
          display:"flex"
        }}>
        {listSessionOpen.map(session => {
          if(session.status === "3"){
            return (
              <div key={session.id} style={{
                border:"solid black 1px",
                margin: "0 15px 0 15px"
              }}>
                <CardContent>
                <Typography variant="h5" component="div">
                  {session.name}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {session.status === "3" ? "Opening" : "Wrong"}
                </Typography>
                <Typography variant="body2">
                  total product: {session.totalProduct}
                  <br/>
                  open - close: {session.openTime === "0" ? 0 : new Date(session.openTime * 1000).toLocaleDateString()} - {session.closeTime === "0" ? 0 : new Date(session.closeTime * 1000).toLocaleDateString()}
                </Typography>
              </CardContent>
              {session.status === "3" &&
                <CardActions>
                  <Button size="small" onClick={()=>{
                    if(session.status !== "3") return
                    getProductBySession(session.ownerSession,session.id)
                    setValue(4)
                  }}>Join</Button>
                </CardActions>
              }
              </div>
            )
          }
          return <></>
        })}
        </div>
      </div>  
    }

    {
      value === 2 &&
      <div>
        <h4>{myListSession.length === 0 ? "You no have session" : "Your session"}</h4>
        <div style={{
          display:"flex"
        }}>
        {myListSession.map((session, index) => {
          return (
            <div key={session.id} style={{
              border:"solid black 1px",
              margin: "0 15px 0 15px"
            }}>
              <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                
              </Typography>
              <Typography variant="h5" component="div">
              {session.id} - {session.name}
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                {session.status === "0" && "None"}
                {session.status === "1" && "Valid"}
                {session.status === "2" && "Invalid"}
                {session.status === "3" && "Opened"}
                {session.status === "4" && "Closed"}
              </Typography>
              {session.status === "4" && 
                <Typography variant="body2">
                  total price: {web3Api.web3.utils.fromWei(session.totalPrice,'ether')} ETH
                </Typography>}
              <Typography variant="body2">
                total product: {session.totalProduct}
                <br/>
                open - close: {session.openTime === "0" ? 0 : new Date(session.openTime * 1000).toLocaleDateString()} - {session.closeTime === "0" ? 0 : new Date(session.closeTime * 1000).toLocaleDateString()}
              </Typography>
            </CardContent>
            {session.status === "1" &&
              <CardActions>
                <Button size="small" onClick={()=>{
                  if(session.status !== "1") return
                  openSession(session.id)
                }}>Open session</Button>
              </CardActions>
            }
            {session.status === "3" &&
              <CardActions>
                <Button size="small" onClick={()=>{
                  if(session.status !== "3") return
                  closeSession(session.id, index)
                }}>Close session</Button>
              </CardActions>
            }
            </div>
          )
        })}
        </div>
      </div>
    }

    {
      value === 3 &&
      <div style={{
        margin: '30px'
        }}>
        <div style={{
        margin: '20px'
        }}>
          <TextField
            style={{
              margin: "0 15px 0 0"
            }}
            onChange={(e)=>{setAddressOwner(e.target.value)}}
            required
            id="outlined-required"
            label="Address owner"
            value={addressOwner}
          />
          <TextField
            style={{
              margin: "0 15px 0 0"
            }}
            onChange={(e)=>{setSessionId(e.target.value)}}
            required
            id="outlined-required"
            label="Session Id"
            value={sessionId}
          />
          <TextField
            style={{
              margin: "0 15px 0 0"
            }}
            onChange={(e)=>{setIsAccept(e.target.value)}}
            required
            id="outlined-required"
            label="accept"
            value={isAccept}
          />
          <TextField
            style={{
              margin: "0 15px 0 0"
            }}
            onChange={(e)=>{setSecret(e.target.value)}}
            required
            id="outlined-required"
            label="Secret"
            type="password"
            value={secret}
          />
        </div>
        <Button variant="outlined" onClick={()=>{
          if(addressOwner === "" || sessionId === "" || secret === "") {
            console.log("fail send open session");
            return
          }
          confirmSession(addressOwner,sessionId, isAccept, secret);
          console.log("send open session success");
          setAddressOwner("")
          setSessionId("")
          setIsAccept("")
          setSecret("")
        }}>Send</Button>
      </div>
    }

    {
      value === 4 &&
      <div>
        <div style={{
          display:"flex"
        }}>
         {currentSession.products && currentSession.products.map((product, index) => {
            return(
              <div key={product.id} style={{
                margin: "15px"
              }}>
                <Card sx={{ maxWidth: 345 }}>
                  <CardMedia
                    sx={{ height: 140 }}
                    image={product.linkImage}
                    title="green iguana"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h4" component="div">
                      {product.name}
                    </Typography>
                    <Typography gutterBottom variant="h6" component="div">
                      Start Price: {web3Api.web3.utils.fromWei(product.startPrice,'ether')} ETH
                    </Typography>
                    <Typography gutterBottom variant="h6" component="div">
                      Current Price: {web3Api.web3.utils.fromWei(product.finalPrice,'ether')} ETH
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <TextField
                      id="standard-number"
                      label="Up price"
                      type="number"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      variant="standard"
                      onChange={(e)=>{setUpPrice(Number(e.target.value))}}
                    />
                    <Button size="small" onClick={()=>{
                      const total = Number(upPrice) + Number(web3Api.web3.utils.fromWei(product.finalPrice,'ether'))
                      alert(`confirm up with ${total} ETH`)
                      upPriceProduct(product.ownerProduct,currentSession.sessionId, product.id, total)
                    }}>Up</Button>
                  </CardActions>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    }
  </div>
);
}

export default App;
