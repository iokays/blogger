---
title: Spring MVC
author: Pengyuanbing
date: 2021-04-13 11:33:00 +0800
categories: [Spring, Spring MVC, 未完待续]
tags: [Spring, Spring MVC, 未完待续]
pin: true
---

本文主要是深入浅出 Spring MVC 的工作原理; 理解各个服务组件的调用和使用方式, 简单的自定义使用这些组件(基类,接口).

<https://github.com/iokays/Samples/tree/main/spring_web>

## 一个例子

```java
@RestController
@SpringBootApplication
public class SpringMvcSample {

  @ApiOperation(value = "/", notes = "print hello")
  @GetMapping(value = "/")
  public String hello() {
    return "hello";
  }

  public static void main(String[] args) {
    SpringApplication.run(SpringMvcSample.class, args);
  }

}
```

这是一个简单的SpringBoot的WEB应用, 当我们访问<http://localhost:8080/> 页面显示.

```console
hello
```

## DispatcherServlet

Spring MVC 围绕 Servlet 设计了DispatcherServlet.




## HandlerMethod

我们先不管SpringBoot 是怎么启动, 我们现在只关心方法是怎么调用的.

SpringMvcSample::hello 这个方法在SpringMVC这中最终是以HandlerMethod存在. 我们再加一个功能, 可以验证HandlerMethod有哪些数据.

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @OverrideException
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws  {
                if (handler instanceof HandlerMethod) {
                    HandlerMethod handlerMethod = (HandlerMethod) handler;
                    final ApiOperation apiOperation = handlerMethod.getMethodAnnotation(ApiOperation.class);

                    logger.info("handlerMethod: {}, apiOperation.notes: {}", handler, apiOperation.notes());

                }
                return true;
            }
        });
    }

}

```

再次请求 logger会打印下面的日志:

```console
: handlerMethod: com.iokays.web.boot.SpringMvcSample#hello(), apiOperation.notes: print hello
```

现在我画出了HandlerMethod的类图关系,和部分属性和方法.做了一些简单的解释.

![handler_method.png](/assets/img/spring_mvc/handler_method.png)

我们发现, 这是用到装饰者模式.

我们从HandlerMethod的UML类图可以看到, 我们看到 Bean, Method, Parameters 等一些参数, 其实我们就可以调用invoke实现方法的执行操作. 但在HandlerMethod没有这样做.
只是对参数做了一些封装.

方法的调用是在InvocableHandlerMethod::doInvoke():```return method.invoke(getBean(), args);```

## HandlerMethodArgumentResolver

当我们在调试InvocableHandlerMethod::getMethodArgumentValues方法的时候, 会发现 HandlerMethodArgumentResolverComposite 这个对象, 这个对象提供了所有的参数解析器.
我们也简单的画出一些重要的UML类图.


![handler_method_argument_resolver.png](/assets/img/spring_mvc/handler_method_argument_resolver.png)

基于HandlerMethodArgumentResolver, 类图我画了一个抽象类和四个具体实现类, 其实远不只这些.

基于AbstractNamedValueMethodArgumentResolver应用了模板方法模式.
resolveArgument实现了通用实现方法,各个子类实现调用的resolveName方法.
通过4个子类的实现, 我们发现是对
RequestParam, RequestBody, ResponseBody,
ServletRequest, HttpServletRequest, MultipartRequest, MultipartHttpServletRequest
ServletResponse, HttpServletResponse赋值操作.

也就是我们在调用方法添加 HttpServletRequest, HttpServletResponse等参数会自动赋值.

```java
public String hello(@RequestParam(value = "value", required = false) String value,
                    HttpServletRequest request, HttpServletResponse response) {
    return "hello";
}
```

而HandlerMethodArgumentResolverCompose 则是用到了组合模式,
argumentResolvers保存的是各个基于HandlerMethodArgumentResolver的实现对象.getArgumentResolver决定了最终调用哪个基于HandlerMethodArgumentResolver.

对于基于HandlerMethodArgumentResolver的分析,我们先到这一步, 其实还有很多细节, 例如RequestResponseBodyMethodProcessor到底使用Gson或jackson的Converter去解析数据.
我们先止步到此.


## HandlerExecutionChain

上述我们描述了invoke时,method的参数是怎么封装的, 现在我们再回过来看看, 在调试的时候,会发现HandlerMethod是被HandlerExecutionChain这个类封装的, 类图如下.

![handler_execution_chain.png](/assets/img/spring_mvc/handler_execution_chain.png)

HandlerExecutionChain整合了Handler和Handler拦截器. 基于拦截器提供了在DispatchServlet::doDispatch方法中的前置, handler::invoke和后置等调用.

## HandlerInterceptor

## HandlerAdapter

## HandlerMapping

## FILTER



