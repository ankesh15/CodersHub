import React from 'react';
import { Code, Trophy, LineChart, Code2 } from 'lucide-react';

const About = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <header className="text-center mb-16">
                <div className="inline-flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl mb-4">
                    <Code2 className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Coders<span className="text-yellow-500">Hub</span> Profiles
                </h1>
                <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                    All Your Coding Profiles in One Place
                </p>
            </header>

            <div className="space-y-12">
                <section className="bg-white dark:bg-[#0f1115] rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
                    <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                        <p>
                            Welcome to CodersHub Profiles, your one-stop solution for managing and showcasing all your coding profiles. Our platform consolidates your coding activities from various sites and provides a comprehensive overview of your coding journey.
                        </p>
                        <p>
                            Whether you're a competitive programmer, a developer, or a learner, CodersHub helps you keep track of your progress and achievements in one place. We aim to bring all your coding accomplishments under one roof, making it easier for you to share your skills with the world.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Core Features</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-[#0f1115] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl mb-4">
                                <Code size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Aggregate Profiles</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Combine your GitHub, LeetCode, and Codeforces stats seamlessly.</p>
                        </div>
                        <div className="bg-white dark:bg-[#0f1115] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl mb-4">
                                <LineChart size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Track Progress</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">View detailed heatmaps and activity charts over time.</p>
                        </div>
                        <div className="bg-white dark:bg-[#0f1115] p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center text-center">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 rounded-xl mb-4">
                                <Trophy size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Global Leaderboard</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Compare your performance with peers globally.</p>
                        </div>
                    </div>
                </section>
                
                <section className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                        Have questions or feedback? Reach out to us at <a href="mailto:support@codershub.com" className="text-yellow-600 dark:text-yellow-500 hover:underline font-medium">support@codershub.com</a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default About;
