import { IExecutor } from './Executor';
import ITask from './Task';

export default async function run(executor: IExecutor, queue: AsyncIterable<ITask>, maxThreads = 0) {
    maxThreads = Math.max(0, maxThreads);
    executor.start();
    const executingTasks = new Set<number>();
    const waitingTasks = new Map<number, ITask[]>();

    for await (const task of queue) {
        if (!waitingTasks.has(task.targetId)) {
            waitingTasks.set(task.targetId, []);
        }
        const targetTasks = waitingTasks.get(task.targetId);
        if (targetTasks)
            waitingTasks.set(task.targetId, targetTasks.concat(task));
    }

    while (waitingTasks.size > 0) {
        const targetIds = Array.from(waitingTasks.keys()).filter(targetId => !executingTasks.has(targetId));
        for (const targetId of targetIds) {
            if (maxThreads > 0 && executingTasks.size >= maxThreads) {
                await Promise.race(Array.from(executingTasks));
            }
            const task = waitingTasks?.get(targetId)?.shift();
            if (task?._onExecute) task._onExecute();
            executingTasks.add(targetId);
            await executor.executeTask(task as ITask);
            if (task?._onComplete) task._onComplete();
            executingTasks.delete(targetId);
            if (waitingTasks?.get(targetId)?.length === 0) {
                waitingTasks.delete(targetId);
            }
        }
    }
    executor.stop();
    return {};
}
