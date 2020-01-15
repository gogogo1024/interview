/*
 * @Author: snoy
 * @Email: jxycbjhc@163.com
 * @Date: 2020-01-15 15:03:16
 * @Last Modified by:   snoy
 * @Last Modified time: 2020-01-15 15:03:16
 * @Description: Description
 */

#include <node.h>
// Linux 系统可以直接引入
// #include "malloc.h"
// Mac 系统上需要
#include <sys/malloc.h>
#include <time.h>
#include <math.h>
#include <stdlib.h>
namespace MergeSort
{
using v8::Array;
using v8::Exception;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;
void mergeAry(int ary[], int begin, int middle, int end)
{
	int aLen = middle - begin + 1;
	int bLen = end - middle;
	// int aryA[aLen];
	int *aryA = (int *)malloc(aLen * sizeof(int));
	// int aryB[bLen];
	int *aryB = (int *)malloc(bLen * sizeof(int));
	int i = 0, j = 0, k = 0;
	for (; k < aLen; ++k)
	{
		aryA[k] = ary[k + begin];
	}
	for (k = 0; k < bLen; ++k)
	{
		aryB[k] = ary[middle + 1 + k];
	}
	for (k = begin; k <= end; ++k)
	{
		if (i >= aLen)
		{
			ary[k] = aryB[j];
			++j;
		}
		else if (j >= bLen)
		{
			ary[k] = aryA[i];
			++i;
		}
		else if (aryA[i] <= aryB[j])
		{
			ary[k] = aryA[i];
			++i;
		}
		else
		{
			ary[k] = aryB[j];
			++j;
		}
	}
	free(aryA);
	free(aryB);
}
void mergeSort(int ary[], int begin, int end)
{
	if (begin < end)
	{
		int middle = (begin + end) / 2;
		mergeSort(ary, begin, middle);
		mergeSort(ary, middle + 1, end);
		mergeAry(ary, begin, middle, end);
	}
}
void merge(const FunctionCallbackInfo<Value> &args)
{
	Isolate *isolate = args.GetIsolate();
	if (args.Length() < 3)
	{
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Wrong number of arguments")));
		return;
	}
	Local<Object> obj = args[0]->ToObject();
	int begin = (int)args[1]->NumberValue();
	int end = (int)args[2]->NumberValue();
	int *ary = (int *)malloc((end + 1) * sizeof(int));
	int i;
	for (i = 0; i <= end; ++i)
	{
		ary[i] = (int)obj->Get(i)->NumberValue();
	}
	mergeSort(ary, begin, end);
	for (i = 0; i <= end; ++i)
	{
		obj->Set(i, Number::New(isolate, ary[i]));
	}
	args.GetReturnValue().Set(obj);
}
void Init(Local<Object> exports)
{
	NODE_SET_METHOD(exports, "merge", merge);
}
NODE_MODULE(merge, Init)
} // namespace MergeSort