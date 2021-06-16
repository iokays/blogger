---
title: Spring AOP
author: Pengyuanbing
date: 2021-04-13 11:33:00 +0800
categories: [Spring, Spring AOP, 未完待续]
tags: [Spring, Spring AOP, JDK动态代理, CGLIB, Aopalliance, 未完待续]
pin: true
---

## JDK 动态代理

```
@ApiModel(description = "JDK动态代理实例")
public class JdkProxySample {

    public static void main(String[] args) {

        final QuackBehavior quack = () -> System.out.println("呱呱叫");

        final QuackInvocationHandler quackInvocationHandler = new QuackInvocationHandler(quack);

        final QuackBehavior duck = (QuackBehavior) Proxy.newProxyInstance(
                quack.getClass().getClassLoader(),
                new Class[]{QuackBehavior.class},
                quackInvocationHandler);

        duck.quack();
    }
}
```

```
@ApiModel("呱呱叫行为接口")
public interface QuackBehavior {
    void quack();
}
```



## AOP的概念

1. 连接点(JoinPoint)
2. 通知(Advice)
3. 切入点(Pointcuts)
4. 切面(Aspects)
5. 织入(Weaving)
6. 目标对象(Target)
7. 引入(Introduction)

## AOP的类型

1. 静态代理

2. 动态代理

## AOP Alliance


## Spring 中的AOP


## Spring AOP 架构

1. Spring AOP 连接点
2. Spring AOP 切面

Advisor

Proxy Factory

3. Spring AOP 通知

前置通知: 通过异常,阻止方法的执行.

后置通知: 可以读取数据, 但不能修改其返回值.可以抛出异常.

环绕通知: 可以修改返回值, 组织方法执行.

异常通知: 对程序流进行的唯一修改是更改抛出的异常类型.
Spring 寻找的第一方法是一个或多个为afterThrowing的公共方法最匹配的一个, 返回的类型不重要, 建议是void.

减少错误的范围, 选择合适的通知.


###Spring AOP pointcut

8
2
6



Spring AOP



interface advisor

ProxyFactoryBean
































