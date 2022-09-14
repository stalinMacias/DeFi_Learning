pragma solidity ^0.6.6;

import "./interfaces/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";


contract UniswapLiquidity {
  address private constant UNISWAP_FACTORY = 0xC608F0718beA3563605aa652589767Cb35fcD05D;
  address private constant UNISWAP_ROUTER = 0x19326b7F6d45e40fDb04C2Cd7c47147c6FA18D92;
  address private constant WETH = 0xf25812889146372f9614c499228620EB7017A569;

  mapping(address => uint) liquidityOwnership;

  event Log(string message, uint value);

  function addLiquidity(address _tokenA, address _tokenB, uint _amountA, uint _amountB) external {
    IERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);
    IERC20(_tokenB).transferFrom(msg.sender, address(this), _amountB);

    IERC20(_tokenA).approve(UNISWAP_ROUTER, _amountA);
    IERC20(_tokenB).approve(UNISWAP_ROUTER, _amountB);

    (uint amountA, uint amountB, uint liquidity) = 
    IUniswapV2Router02(UNISWAP_ROUTER).addLiquidity(
      _tokenA,
      _tokenB,
      _amountA,
      _amountB,
      1,
      1,
      address(this),
      block.timestamp
    );

    // Return the remaining tokens to the provider - All the tokens that were not added to the pool
    uint remainingTokenA = _amountA - amountA;
    uint remainingTokenB = _amountB - amountB;

    IERC20(_tokenA).transferFrom(address(this), msg.sender, remainingTokenA);
    IERC20(_tokenB).transferFrom(address(this), msg.sender, remainingTokenB);
    
    // Update the total provider's liquidity - total liquidity that a provider helds on this contract
    liquidityOwnership[msg.sender] = liquidityOwnership[msg.sender] + liquidity;

    // Retrieve the total liquidity provider tokens that this contract helds
    address pair = IUniswapV2Factory(UNISWAP_FACTORY).getPair(_tokenA, _tokenB);
    uint contractOriginalLiquidity = IERC20(pair).balanceOf(address(this));

    emit Log("amountA added to the pool: ",amountA);
    emit Log("amountB added to the pool: ",amountB);
    emit Log("Liquidity added to the pool: ",liquidity);
    emit Log("Total liquidity held by the provider", liquidityOwnership[msg.sender]);
    emit Log("Total liquidity provider tokens held in this contract: ", contractOriginalLiquidity);

    uint totalTokenA = IERC20(_tokenA).balanceOf(address(this));
    emit Log("Total tokenA held in this contract: ", totalTokenA);

    uint totalTokenAInPool = IERC20(_tokenA).balanceOf(pair);
    emit Log("Total tokenA held in the pool contract: ", totalTokenAInPool);

  }

  function removeLiquidity(address _tokenA, address _tokenB) external {
    uint liquidity = liquidityOwnership[msg.sender]; // Provider's total liquidity
    require(liquidity > 0, "Error, this address have not provided any liquidity");

    address pair = IUniswapV2Factory.getPair(_tokenA, _tokenB);
    uint contractOriginalLiquidity = IERC20(pair).balanceOf(address(this));

    IERC20(pair).approve(UNISWAP_ROUTER, liquidity);
    
    // Set provider's liquidity to 0 - prevent reentrancy
    liquidityOwnership[msg.sender] = 0;
    // Remove provider's liquidity from this contract and send tokens A & B to te provider's address
    (uint amountA, uint amountB) = IUniswapV2Router02(UNISWAP_ROUTER).removeLiquidity(_tokenA,_tokenB,liquidity,1,1,msg.sender,block.timestamp);

    uint contractRemainingLiquidity = IERC20(pair).balanceOf(address(this));
    emit Log("Token A Returned a total of:" , amountA);
    emit Log("Token B Returned a total of:" , amountB);
    emit Log("Original Liquidity in this contract: ", contractOriginalLiquidity);
    emit Log("Remaining Liquidity in this contract: ", contractRemainingLiquidity);

    uint totalTokenA = IERC20(_tokenA).balanceOf(address(this));
    emit Log("Total tokenA held in this contract: ", totalTokenA);

  }
  
}