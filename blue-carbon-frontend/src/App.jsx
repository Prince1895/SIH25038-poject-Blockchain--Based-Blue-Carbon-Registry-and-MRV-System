import { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { contractAbi } from './abi.js';
import './App.css';

// --- CONFIGURATION ---
const API_URL = 'https://backendcarbon.onrender.com/api';
const CONTRACT_ADDRESS = "YOUR_LIVE_SEPOLIA_CONTRACT_ADDRESS"; 

function App() {
  // State for forms and data
  const [formData, setFormData] = useState({
    email: '', password: '', role: 'VERIFIER', tier: 1, name: '',
    secret: '', otp: '', userId: '', taskId: '',
    industryId: '', verifierId: '',
    tokenURI: 'ipfs://your_metadata_goes_here',
    tokenId: '', price: '', bidAmount: ''
  });
  const [adminToken, setAdminToken] = useState('');
  const [verifierToken, setVerifierToken] = useState('');
  const [industryToken, setIndustryToken] = useState('');
  const [responseText, setResponseText] = useState('API responses will appear here...');
  
  // State for direct contract interaction
  const [contract, setContract] = useState(null);
  const [signerAddress, setSignerAddress] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask is not installed.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);
      
      setContract(contractInstance);
      setSignerAddress(await signer.getAddress());
      setResponseText(`Wallet connected: ${await signer.getAddress()}`);
    } catch (error) {
      setResponseText(`Wallet connection failed: ${error.message}`);
    }
  };

  const apiCall = async (method, url, data, token) => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios[method](`${API_URL}${url}`, data, config);
      setResponseText(JSON.stringify(res.data, null, 2));
      return res.data;
    } catch (error) {
      setResponseText(JSON.stringify(error.response?.data || error.message, null, 2));
    }
  };

  const handleListForSale = async () => {
    if (!contract) return alert("Please connect your wallet first.");
    try {
      const { tokenId, price } = formData;
      const priceInWei = ethers.parseEther(price);
      setResponseText("Sending transaction to list credit...");
      const tx = await contract.listCreditForSale(tokenId, priceInWei);
      await tx.wait();
      setResponseText(`Transaction successful! Hash: ${tx.hash}`);
    } catch (error) {
      setResponseText(`Error: ${error.reason || error.message}`);
    }
  };

  const handlePlaceBid = async () => {
    if (!contract) return alert("Please connect your wallet first.");
    try {
      const { tokenId, bidAmount } = formData;
      setResponseText("Sending bid transaction...");
      const tx = await contract.placeBid(tokenId, { value: ethers.parseEther(bidAmount) });
      await tx.wait();
      setResponseText(`Bid placed successfully! Hash: ${tx.hash}`);
    } catch (error) {
      setResponseText(`Error: ${error.reason || error.message}`);
    }
  };

  return (
    <div className="App">
      <h1>Blue Carbon Registry - API Test Dashboard</h1>
      
      <div className="card">
        <h2>1. Admin Setup (Run Once)</h2>
        <input name="email" placeholder="Admin Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Admin Password" onChange={handleChange} />
        <input name="secret" placeholder="ADMIN_SETUP_SECRET" onChange={handleChange} />
        <button onClick={() => apiCall('post', '/setup/register', { email: formData.email, password: formData.password, secret: formData.secret })}>Create Initial Admin</button>
      </div>

      <div className="card">
        <h2>2. User Registration</h2>
        <input name="email" placeholder="User Email" onChange={handleChange} />
        <input name="name" placeholder="User Name" onChange={handleChange} />
        <input name="password" type="password" placeholder="User Password" onChange={handleChange} />
        <select name="role" onChange={handleChange} value={formData.role}>
          <option value="VERIFIER">Verifier (NGO)</option>
          <option value="INDUSTRY">Industry</option>
        </select>
        {formData.role === 'INDUSTRY' && <input name="tier" type="number" placeholder="Industry Tier (e.g., 1)" onChange={handleChange} />}
        <button onClick={() => apiCall('post', '/auth/register', { email: formData.email, name: formData.name, password: formData.password, role: formData.role, tier: parseInt(formData.tier) })}>Register User</button>
      </div>
      
     <div className="card">
        <h2>3. Login & Activation</h2>
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password (for login)" onChange={handleChange} />
        <button onClick={() => apiCall('post', '/auth/login', { email: formData.email, password: formData.password })}>
          Step 1: Login with Password (Get OTP)
        </button>
        <hr/>
        <input name="otp" placeholder="OTP from Email" onChange={handleChange} />
        <button onClick={async () => {
          const data = await apiCall('post', '/auth/verify-login', { email: formData.email, otp: formData.otp });
          if(data && data.token) {
            if(data.user.role === 'ADMIN') setAdminToken(data.token);
            else if(data.user.role === 'VERIFIER') setVerifierToken(data.token);
            else if(data.user.role === 'INDUSTRY') setIndustryToken(data.token);
          }
        }}>
          Step 2: Verify OTP & Get Token
        </button>
        <hr/>
        <button onClick={() => apiCall('post', '/auth/activate', { email: formData.email, otp: formData.otp })}>
          Activate New Account (One-Time Use)
        </button>
      </div>
      
      <div className="card">
        <h2>4. Admin Panel</h2>
        <p>Admin Token: <textarea value={adminToken} readOnly rows={2} /></p>
        <input name="userId" placeholder="User ID to Approve" onChange={handleChange} />
        <button onClick={() => apiCall('post', `/admin/approve-user/${formData.userId}`, {}, adminToken)}>Approve User</button>
        <hr/>
        <input name="industryId" placeholder="Industry ID for Task" onChange={handleChange} />
        <input name="verifierId" placeholder="Verifier ID for Task" onChange={handleChange} />
        <button onClick={() => apiCall('post', '/admin/tasks', { industryId: parseInt(formData.industryId), verifierId: parseInt(formData.verifierId), dueDate: new Date() }, adminToken)}>Create Task</button>
        <hr/>
        <input name="taskId" placeholder="Task ID to Approve & Mint" onChange={handleChange} />
        <input name="tokenURI" placeholder="Token URI (e.g., ipfs://...)" onChange={handleChange} />
        <button onClick={() => apiCall('post', `/admin/tasks/${formData.taskId}/approve-and-mint`, { tokenURI: formData.tokenURI }, adminToken)}>Approve & Mint Credit</button>
      </div>
      
      <div className="card">
        <h2>5. Verifier Panel</h2>
        <p>Verifier Token: <textarea value={verifierToken} readOnly rows={2} /></p>
        <button onClick={() => apiCall('get', '/tasks/my-tasks', null, verifierToken)}>Get My Tasks</button>
        <hr/>
        <input name="taskId" placeholder="Task ID to Submit" onChange={handleChange} />
        <button onClick={() => apiCall('post', `/tasks/${formData.taskId}/submit`, { evidenceKeys: [`evidence/${formData.taskId}/test-file.jpg`] }, verifierToken)}>Submit Task Report</button>
      </div>

      <div className="card">
        <h2>6. Industry Panel (Direct Blockchain Interaction)</h2>
        <p>Connected Wallet: <strong>{signerAddress || "Not Connected"}</strong></p>
        <p>Industry Token: <textarea value={industryToken} readOnly rows={2} /></p>
        <button onClick={connectWallet}>Connect Wallet & Load Contract</button>
        <hr/>
        <h3>List a Credit for Sale</h3>
        <input name="tokenId" placeholder="Token ID to Sell" onChange={handleChange} />
        <input name="price" placeholder="Price in ETH (e.g., 0.01)" onChange={handleChange} />
        <button onClick={handleListForSale}>List for Sale</button>
        <hr/>
        <h3>Place a Bid</h3>
        <input name="tokenId" placeholder="Token ID to Bid On" onChange={handleChange} />
        <input name="bidAmount" placeholder="Bid Amount in ETH" onChange={handleChange} />
        <button onClick={handlePlaceBid}>Place Bid</button>
      </div>

      <div className="card response-card">
        <h2>API Response</h2>
        <pre><code>{responseText}</code></pre>
      </div>
    </div>
  );
}

export default App;