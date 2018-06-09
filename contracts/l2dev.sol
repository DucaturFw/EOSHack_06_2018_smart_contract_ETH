pragma solidity ^0.4.19;

contract l2dex {
    
    enum State { open, close, empty }
    struct Channel {
        uint256 ttl;
        uint256 mv;
        uint32  nonce;
        uint256 sum;
        State state;
    }
    
    mapping(address => Channel) public channels;
    address public dexOracle;

    uint256 public constant withdrowPeriod = 60 minutes;

    event OnPayment(address sender, uint256 value);
    event OnWithdraw(address sender, uint256 value);
    event OpenChanel(address sender, uint256 value, uint256 ttl);
    event CloseChanel(address sender);
    
    modifier isNotInitiated(address _trader) {
	    require(channels[_trader].state == State.empty || channels[_trader].state == State.close );
	    _;
	}
	
    function l2ex(address _dex) public {
        dexOracle = _dex;
        // todo something :) 
    }
    
    function openChanel(uint256 _ttl, uint256 _mv) payable public {
        // open channel
        // require(channels[msg.sender].state!=State.open);
        channels[msg.sender].ttl=now+_ttl;
        channels[msg.sender].nonce=0;
        channels[msg.sender].mv=_mv;
        //require(msg.value>=mv);
        if(msg.value>0){
            channels[msg.sender].sum = msg.value;
        } else {
            channels[msg.sender].sum = 0;
        }
        channels[msg.sender].state = State.open;
        
        emit OpenChanel(msg.sender, channels[msg.sender].sum, channels[msg.sender].ttl);
    }
    
    function closeChanelReq() public { //request to withdrow balance
        emit CloseChanel(msg.sender);
        channels[msg.sender].ttl=now+withdrowPeriod;
    }
    
    function withdrow() public {
        require(now > channels[msg.sender].ttl);
        msg.sender.transfer(channels[msg.sender].sum);
        channels[msg.sender].state = State.close;
    }
    
    function pushOffChain(address _channelOwner, uint32 _nonce, uint256 _val, address _channeelDest, uint8 v,bytes32 r,bytes32 s) public {
        require(channels[_channelOwner].sum >= _val); //check channel sum
        require(_channelOwner == ecrecover(keccak256(_channelOwner, _channeelDest, _nonce,_val), v, r, s));
        channels[_channelOwner].sum-=_val; //decrement from channel
        channels[_channeelDest].sum+=_val; //increment to channel
    }

	function () payable public { //update chanels 
		channels[msg.sender].sum+=msg.value;
		emit OnPayment(msg.sender,msg.value);
	}

}