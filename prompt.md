GPT-4, chatgpt web

Q: You are a professional full-stack engineer. You are good at crypto-related project. Your tech stack includes nextjs, ethers.js, tailwindcss, solidity. Your goal is deliver code from my instruction. We needs to work on a new project, are you ready?

A: I'm ready! Let's dive into the new project. What are we building, and what do you have in mind so far?

Q: Now, create a react project which can connect metamask and walletconnect with ethers.js

这里给了一个cra+js的创建命令，附带连接钱包方法

Q: recreate with typescript

这里用ts重新写了一遍上面的实现，但还是有很多bug

（针对bug提问）

Q: there is a little mistake in connect wallet component, providers doesn't exist in ethers, can you recreate this component
(引用了不存在的内容，让他重写)

重写完引用的内容依然不存在，只好手改

Q: when i start the dev server, webpack shows error: Module not found: Error: Can't resolve 'stream', BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default. This is no longer the case. Verify if you need this module and configure a polyfill for it.

这里给出了craco修改webpack配置的方法，但是代码是错的，只好手改

Q: now deploy it to github pages with github actions

这里给了action的yml和相关的项目脚本，其中 1. 项目脚本丢失了上下文（又从craco回到了react-script），且新的脚本只是跑一遍旧的，所以这部分没意义 2. yml文件缺失配置信息，只好手改（这里还需要对repo权限改动也没有提到）

Q: Tell me eth mainnet chain id and a public free rpc url

这里还是让我注册Infura/Alchemy，只好手动填

Q: The walletconnect function doesn't work, because it has upgrade to v2 and v1 was shut down, can you do it with v2 instead?

这里ai表示好的，他会升级到v2的写法，但只是生成了一份逻辑不通的v1代码

到这里放弃AI，整个connect全部用reown手动重写

主要问题：1. 上下文关联过差 2. 知识库中包含大量过时内容 3. 没有逻辑思维，导致大量的捏造代码

手动配置了tailwind，因为ai的配置是错的，使用cra的情况下需要老版本才行

换用cursor(claude 3.5 sonnet)

Q: generate a header with 3 navigation tab: trade, liquidity, history
直接写了3个a，其实更希望写成规则文件，但是描述太详细比自己直接写要慢，，，


之后的生成都比较顺利，没有遇到什么问题，prompt模版大概是，generate {something} contains {ui} can {function} with {techstack}
主要的问题是
1.生成的代码扩展性/阅读性比较差，需要手动修改
2. 功能逻辑需要手写一遍才能生成类似代码(但过于依赖重复性，比如我写过正确的代码，但会生成重复率高的错误代码)，ui大部分可以直接work

AI完成了合约的编写，交易页面，流动性页面，历史页面
我针对性的改善了细节，以及大量的bug修复，比如状态判断，精度换算等
